import { ButtonInteraction, EmbedBuilder, TextChannel } from "discord.js";
import { Avatar } from "../models";

export default async function createAvatar(interaction: ButtonInteraction) {
    let embed = new EmbedBuilder()
        .setTitle("Create an Avatar")
        .setDescription("Please provide a name for your avatar:")
        .setColor("#5865F2")
        .setAuthor({
            name: interaction.user.tag,
            iconURL: interaction.user.displayAvatarURL(),
        })
        .setFooter({
            text: process.env.NAME + " • Avatar Creator",
            iconURL: interaction.client.user.displayAvatarURL(),
        })
        .setThumbnail(interaction.user.displayAvatarURL())
        .setImage("attachment://banner-avatars.png")
        .setTimestamp();

    await interaction.editReply({ embeds: [embed] });

    // Listen for the user's response
    const filter = (response: any) => {
        return response.author.id === interaction.user.id;
    };

    let ch = interaction.channel as TextChannel;

    const collector = ch.createMessageCollector({
        filter,
        max: 1,
        time: 60000,
    });

    collector.on("collect", async (response) => {
        // Handle the user's response
        const avatarName = response.content;
        embed
            .setFields([
                { name: "Avatar Name", value: avatarName, inline: true },
            ])
            .setDescription(
                "Please provide a bracket for your avatar, including 'text' word"
            );

        interaction.editReply({ embeds: [embed] });

        const bracketFilter = (response) => {
            return response.author.id === interaction.user.id;
        };

        const bracketCollector = ch.createMessageCollector({
            filter: bracketFilter,
            max: 1,
            time: 60000,
        });

        bracketCollector.on("collect", async (response) => {
            const bracket = response.content;
            embed
                .setFields([
                    { name: "Avatar Name", value: avatarName, inline: true },
                    { name: "Avatar Bracket", value: bracket, inline: true },
                ])
                .setDescription("Please provide an image URL for your avatar:");
            interaction.editReply({ embeds: [embed] });
            await response.delete();

            let iconCollector = ch.createMessageCollector({
                filter: (response) =>
                    response.author.id === interaction.user.id,
                max: 1,
                time: 60000,
            });

            iconCollector.on("collect", async (response) => {
                const iconUrl = response.content;
                embed
                    .setFields([
                        {
                            name: "Avatar Name",
                            value: avatarName,
                            inline: true,
                        },
                        {
                            name: "Avatar Bracket",
                            value: bracket,
                            inline: true,
                        },
                    ])
                    .setThumbnail(iconUrl)
                    .setDescription(
                        `${avatarName} has been created! Try sending ${bracket.replace(
                            "text",
                            "Hello!"
                        )}`
                    );

                let avatar = await Avatar.create({
                    userId: interaction.user.id,
                    name: avatarName,
                    bracket: bracket,
                    icon: iconUrl,
                });

                await avatar.save();

                interaction.editReply({ embeds: [embed] });
                await response.delete();
            });
        });

        await response.delete();
    });
}
