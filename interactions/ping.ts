import { ChatInputCommandInteraction } from "discord.js";
import { createPingEmbed } from "../utils/embeds";

const ping = async (interaction: ChatInputCommandInteraction, now: number) => {
    const botLatency = Date.now() - now;
    const apiLatency = interaction.client.ws.ping;

    const pingEmbed = createPingEmbed(botLatency, apiLatency).addFormattedField(
        "Uptime",
        formatUptime(interaction.client.uptime || 0),
        true
    );

    await interaction.editReply({ embeds: [pingEmbed] });
};

function formatUptime(uptime: number): string {
    const days = Math.floor(uptime / (24 * 60 * 60 * 1000));
    const hours = Math.floor(
        (uptime % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000)
    );
    const minutes = Math.floor((uptime % (60 * 60 * 1000)) / (60 * 1000));

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
}

export default ping;
