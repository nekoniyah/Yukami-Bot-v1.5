import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    EmbedBuilder,
} from "discord.js";
import locale from "../locales/locale";

export default async function avatarHelp(interaction: ButtonInteraction) {
    try {
        const loc = await locale(interaction.locale ?? "en");

        const helpEmbed = new EmbedBuilder()
            .setTitle("🎓 Avatar System Guide")
            .setDescription("Learn how to use the avatar system effectively!")
            .setColor("#00D4AA")
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .addFields([
                {
                    name: "🎭 What are Avatars?",
                    value: "Avatars are characters you can create to roleplay in Discord. Each avatar has unique stats, appearance, and abilities based on their species and level.",
                    inline: false,
                },
                {
                    name: "✨ Creating Avatars",
                    value: "• Click **Create Avatar** button\n• Fill out the modal with name, bracket, and image\n• Choose a species from the dropdown\n• Your avatar is ready to use!",
                    inline: true,
                },
                {
                    name: "💬 Using Avatars",
                    value: "• Type your message using your avatar's bracket\n• Example: `[Hello everyone!]` becomes a message from your avatar\n• The bot will replace your message with a webhook",
                    inline: true,
                },
                {
                    name: "📊 Leveling System",
                    value: "• Avatars gain experience by being used\n• Higher levels unlock better stats\n• Each species has different stat growth\n• Max level is 100",
                    inline: false,
                },
                {
                    name: "🔧 Management",
                    value: "• **Edit Name**: Change your avatar's name\n• **Edit Bracket**: Modify message format\n• **Edit Image**: Update avatar appearance\n• **Delete**: Remove unwanted avatars",
                    inline: true,
                },
                {
                    name: "🌟 Pro Tips",
                    value: "• Choose brackets that don't conflict with others\n• Use descriptive names for easy identification\n• Higher resolution images look better\n• Each user can have up to 10 avatars",
                    inline: true,
                },
            ])
            .setFooter({
                text: `${
                    process.env.NAME ?? "Yukami Bot"
                } • Avatar System Help`,
                iconURL: interaction.client.user.displayAvatarURL(),
            })
            .setTimestamp();

        const backButton = new ButtonBuilder()
            .setCustomId("back_to_avatars")
            .setLabel("◀️ Back to Avatars")
            .setStyle(ButtonStyle.Primary);

        const supportButton = new ButtonBuilder()
            .setLabel("🆘 Get Support")
            .setStyle(ButtonStyle.Link)
            .setURL("https://discord.gg/your-support-server"); // Add your support server

        const components = [
            new ActionRowBuilder()
                .addComponents(backButton, supportButton)
                .toJSON(),
        ];

        await interaction.update({
            embeds: [helpEmbed],
            components,
        });
    } catch (error) {
        console.error("Error in avatar help:", error);
        await interaction.reply({
            content: "❌ Failed to load help information.",
            ephemeral: true,
        });
    }
}
