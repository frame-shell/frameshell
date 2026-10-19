/*
 * ShellBridge native side. Runs in Vesktop's main process (Node), where Unix sockets
 * are available. Connects to the shell, forwards events and queues commands that
 * index.ts picks up.
 */

import { IpcMainInvokeEvent } from "electron";
import { createConnection, Socket } from "net";
import { join } from "path";

const socketPath = join(process.env.XDG_RUNTIME_DIR ?? "/tmp", "qs-discord.sock");

let socket: Socket | null = null;
let buffer = "";
let wanted = false;
const commands: unknown[] = [];

function open() {
    if (!wanted || socket)
        return;

    const connection = createConnection(socketPath);
    socket = connection;
    connection.setEncoding("utf8");

    connection.on("data", (chunk: string) => {
        buffer += chunk;
        let newline: number;
        while ((newline = buffer.indexOf("\n")) >= 0) {
            const line = buffer.slice(0, newline).trim();
            buffer = buffer.slice(newline + 1);
            if (!line)
                continue;
            try {
                commands.push(JSON.parse(line));
            } catch {
                // Ignore broken lines
            }
        }
    });

    // The shell may not run yet; "close" follows and retries
    connection.on("error", () => { });

    connection.on("close", () => {
        socket = null;
        buffer = "";
        setTimeout(open, 3000);
    });
}

export function connect(_: IpcMainInvokeEvent) {
    wanted = true;
    open();
}

export function disconnect(_: IpcMainInvokeEvent) {
    wanted = false;
    socket?.destroy();
    socket = null;
}

export function send(_: IpcMainInvokeEvent, event: unknown) {
    if (socket && socket.writable)
        socket.write(`${JSON.stringify(event)}\n`);
}

export function takeCommands(_: IpcMainInvokeEvent) {
    return commands.splice(0);
}
