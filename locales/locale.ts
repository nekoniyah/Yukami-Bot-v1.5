import fs from "fs";

export default async function locale(locale?: string) {
    let { default: def } = await import("./en.json");
    try {
        const data = JSON.parse(
            fs.readFileSync(__dirname + `/${locale}.json`, "utf-8")
        );

        return locale ? data : (def as typeof def);
    } catch {
        return def;
    }
}
