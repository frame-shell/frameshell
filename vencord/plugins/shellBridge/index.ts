/*
 * ShellBridge – Vencord user plugin for roxy-dots
 *
 * Sends Discord events to the Quickshell shell over a Unix socket and runs the actions
 * the shell sends back. Protocol: see quickshell/.config/quickshell/services/DiscordBridge.qml.
 *
 * Events: DMs and mentions, people joining/leaving your voice channel (and channels you
 * watch, see "Watch in shell" in a voice channel's right-click menu), scheduled server
 * events going live, incoming calls and how they ended (answered, declined, missed), your own mute/deafen changes.
 * Actions: accept/decline call, call back, join a watched channel, open channel, toggle mute/deafen.
 *
 * Not tested yet (waits for the move to Linux). Discord's internal module and event
 * names change now and then; if something stops working, check them first.
 */

import { NavContextMenuPatchCallback } from "@api/ContextMenu";
import { definePluginSettings } from "@api/Settings";
import definePlugin, { OptionType, PluginNative } from "@utils/types";
import { findByPropsLazy, findStoreLazy } from "@webpack";
import { ChannelStore, GuildStore, Menu, NavigationRouter, React, SelectedChannelStore, UserStore } from "@webpack/common";

const Native = VencordNative.pluginHelpers.ShellBridge as PluginNative<typeof import("./native")>;

const settings = definePluginSettings({
    watchedChannels: {
        type: OptionType.STRING,
        description: "Voice channel IDs to watch even when you are not in them, comma separated",
        default: ""
    }
});

function watchedChannels(): string[] {
    return settings.store.watchedChannels.split(",").map(id => id.trim()).filter(Boolean);
}

function toggleWatch(channelId: string) {
    const list = watchedChannels();
    settings.store.watchedChannels = (list.includes(channelId)
        ? list.filter(id => id !== channelId)
        : list.concat(channelId)).join(",");
}

// Voice channels (2) and stage channels (13) get "Watch in shell" in their right-click menu
const channelContextMenu: NavContextMenuPatchCallback = (children, { channel }: any) => {
    if (!channel || (channel.type !== 2 && channel.type !== 13))
        return;
    const watching = watchedChannels().includes(channel.id);
    children.push(React.createElement(Menu.MenuItem, {
        id: "shellbridge-watch",
        label: watching ? "Stop watching in shell" : "Watch in shell",
        action: () => toggleWatch(channel.id)
    }));
};

const MediaEngineStore = findStoreLazy("MediaEngineStore");
const VoiceStateStore = findStoreLazy("VoiceStateStore");
const ChannelActions = findByPropsLazy("selectVoiceChannel", "selectChannel");
const AudioActions = findByPropsLazy("toggleSelfMute", "toggleSelfDeaf");
const CallActions = findByPropsLazy("stopRinging", "ring");

let commandPoll: ReturnType<typeof setInterval> | undefined;
// Calls we already told the shell about, so CALL_UPDATE does not repeat them
const ringingCalls = new Map<string, { caller: string; avatar: string }>();
// Calls declined from the shell; anything else that stops ringing without you joining is missed
const declinedCalls = new Set<string>();
// Scheduled events already announced as started
const startedEvents = new Set<string>();

function displayName(user: any): string {
    return user?.globalName ?? user?.username ?? "someone";
}

function avatarOf(user: any): string {
    return user?.getAvatarURL?.(undefined, 128) ?? "";
}

function channelName(channelId: string | null | undefined): string {
    const channel = channelId ? ChannelStore.getChannel(channelId) : null;
    return channel?.name || "call";
}

function membersIn(channelId: string): number {
    return Object.keys(VoiceStateStore.getVoiceStatesForChannel(channelId) ?? {}).length;
}

function sendSelfState() {
    const voice = SelectedChannelStore.getVoiceChannelId();
    Native.send({
        type: "self",
        muted: MediaEngineStore.isSelfMute(),
        deafened: MediaEngineStore.isSelfDeaf(),
        channel: voice ? channelName(voice) : ""
    });
}

function handleCall(channelId: string, ringing: string[] | undefined) {
    const me = UserStore.getCurrentUser()?.id;
    const ringsMe = !!me && (ringing ?? []).includes(me);

    if (ringsMe && !ringingCalls.has(channelId)) {
        const channel = ChannelStore.getChannel(channelId);
        // In a DM the other recipient is the caller; group calls use the group name
        const user = UserStore.getUser(channel?.recipients?.[0]);
        const info = { caller: channel?.name || displayName(user), avatar: avatarOf(user) };
        ringingCalls.set(channelId, info);
        Native.send({ type: "call", state: "ringing", ...info, channelId });
    } else if (!ringsMe && ringingCalls.has(channelId)) {
        endCall(channelId);
    }
}

// Ringing stopped: tell the shell whether you answered, declined or missed it.
// Joining updates the voice store a moment after the ringing list, so wait a little.
// Declining inside Discord itself cannot be told apart from the caller hanging up; it shows as missed.
function endCall(channelId: string) {
    const info = ringingCalls.get(channelId);
    if (!info)
        return;
    ringingCalls.delete(channelId);
    setTimeout(() => {
        const reason = SelectedChannelStore.getVoiceChannelId() === channelId ? "accepted"
            : declinedCalls.delete(channelId) ? "declined" : "missed";
        Native.send({ type: "call", state: "ended", reason, ...info, channelId });
    }, 400);
}

function run(command: any) {
    switch (command?.cmd) {
        case "accept_call":
            ChannelActions.selectVoiceChannel(command.channelId);
            break;
        case "decline_call":
            declinedCalls.add(command.channelId);
            CallActions.stopRinging(command.channelId);
            break;
        case "call_back":
            // Join the DM call and ring the others; ring()'s arguments are a guess until tested
            ChannelActions.selectVoiceChannel(command.channelId);
            try {
                CallActions.ring(command.channelId);
            } catch (e) {
                console.warn("[ShellBridge] ring failed", e);
            }
            break;
        case "join_voice":
            ChannelActions.selectVoiceChannel(command.channelId);
            break;
        case "open_channel":
            NavigationRouter.transitionTo(`/channels/${command.guildId ?? "@me"}/${command.channelId}`);
            break;
        case "toggle_mute":
            AudioActions.toggleSelfMute();
            break;
        case "toggle_deafen":
            AudioActions.toggleSelfDeaf();
            break;
    }
}

export default definePlugin({
    name: "ShellBridge",
    description: "Sends Discord events to the Quickshell desktop shell and takes actions back",
    authors: [{ name: "vxnsin", id: 0n }],
    settings,

    contextMenus: {
        "channel-context": channelContextMenu
    },

    flux: {
        // DMs and messages that mention you
        MESSAGE_CREATE({ message, optimistic }: any) {
            if (optimistic)
                return;
            const me = UserStore.getCurrentUser();
            if (!me || message.author?.id === me.id)
                return;
            const channel = ChannelStore.getChannel(message.channel_id);
            const isDm = channel?.isPrivate?.() ?? false;
            const mentioned = message.mention_everyone || (message.mentions ?? []).some((u: any) => u.id === me.id);
            if (!isDm && !mentioned)
                return;
            const guild = channel?.guild_id ? GuildStore.getGuild(channel.guild_id) : null;
            Native.send({
                type: "message",
                author: message.author.global_name ?? message.author.username,
                channel: channel?.name ?? "",
                guild: guild?.name ?? "",
                content: message.content || "(attachment)",
                avatar: message.author.avatar
                    ? `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.png?size=128`
                    : "",
                channelId: message.channel_id,
                guildId: channel?.guild_id ?? null
            });
        },

        // Someone joins or leaves the voice channel you are in, or one you watch
        VOICE_STATE_UPDATES({ voiceStates }: any) {
            const me = UserStore.getCurrentUser()?.id;
            const mine = SelectedChannelStore.getVoiceChannelId();
            const relevant = [mine, ...watchedChannels()].filter((id, i, all) => id && all.indexOf(id) === i) as string[];
            if (relevant.length === 0)
                return;
            for (const { userId, channelId, oldChannelId } of voiceStates) {
                if (userId === me)
                    continue;
                for (const watchedId of relevant) {
                    const joined = channelId === watchedId && oldChannelId !== watchedId;
                    const left = oldChannelId === watchedId && channelId !== watchedId;
                    if (!joined && !left)
                        continue;
                    const user = UserStore.getUser(userId);
                    Native.send({
                        type: "voice",
                        action: joined ? "join" : "leave",
                        user: displayName(user),
                        channel: channelName(watchedId),
                        count: membersIn(watchedId),
                        avatar: avatarOf(user),
                        channelId: watchedId,
                        // Only watched channels you are not in get a join button
                        watched: watchedId !== mine
                    });
                }
            }
        },

        // A scheduled server event goes live (status 2 = active)
        GUILD_SCHEDULED_EVENT_UPDATE({ guildScheduledEvent: event }: any) {
            if (!event || event.status !== 2 || startedEvents.has(event.id))
                return;
            startedEvents.add(event.id);
            const guild = GuildStore.getGuild(event.guild_id);
            Native.send({
                type: "event",
                name: event.name,
                guild: guild?.name ?? "",
                // Stage (1) and voice (2) events have a channel to join, external (3) a location
                channel: event.channel_id ? channelName(event.channel_id) : "",
                location: event.entity_metadata?.location ?? "",
                channelId: event.channel_id ?? null,
                guildId: event.guild_id
            });
        },

        CALL_CREATE({ channelId, ringing }: any) {
            handleCall(channelId, ringing);
        },

        CALL_UPDATE({ channelId, ringing }: any) {
            handleCall(channelId, ringing);
        },

        // The caller hung up before anyone answered
        CALL_DELETE({ channelId }: any) {
            endCall(channelId);
        },

        // The store updates right after the event, so read it a moment later
        AUDIO_TOGGLE_SELF_MUTE() {
            setTimeout(sendSelfState, 50);
        },

        AUDIO_TOGGLE_SELF_DEAF() {
            setTimeout(sendSelfState, 50);
        }
    },

    start() {
        Native.connect();
        // The native side cannot call into the renderer, so pick up commands here
        commandPoll = setInterval(async () => {
            for (const command of await Native.takeCommands())
                run(command);
        }, 300);
    },

    stop() {
        clearInterval(commandPoll);
        ringingCalls.clear();
        declinedCalls.clear();
        Native.disconnect();
    }
});
