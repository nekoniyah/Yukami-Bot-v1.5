# My Discord Bot Project Template

# Folders

-   `events/`: Contains event handlers for the bot.
-   `registers/`: Contains command registration logic.
-   `interactions/`: Contains interaction handlers for the bot.

# Utility

-   `eventBuilder.ts` - type-safe function to return the right event type in your separated files.

## eventBuilder

**Usage**

```ts
// Imagine it's the ready.ts file
import eventBuilder from "./eventBuilder.ts";

export default eventBuilder<"ready">((client) => {
    // Do your stuff here, client parameter is typed.
});
```

# What You Have To Do

1. Create a `.env` file in the root directory and add your Discord bot token:

    ```
    TOKEN=your_bot_token
    ```

2. Implement your bot's functionality by adding event handlers in the `events/` folder.

3. Define your bot's commands in the `registers/` folder.

4. Handle interactions in the `interactions/` folder.

5. Add your database tables with Sequelize in `db.ts`
