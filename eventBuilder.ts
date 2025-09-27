import { ChatInputCommandInteraction, type ClientEvents } from "discord.js";

export default function eventBuilder<Name extends keyof ClientEvents>(
    listener: (...event: ClientEvents[Name]) => void
) {
    return listener;
}

export type TypicalInteractionFn = (
    interaction: ChatInputCommandInteraction,
    { now }: { now: number }
) => void;
