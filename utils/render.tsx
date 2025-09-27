import fs from "fs";
import path from "path";
import { ImageResponse } from "@vercel/og";


export async function renderComponentToPng(
    componentName: string,
    props: { [key: string]: any }
) {
    const componentPath = path.join(
        process.cwd(),
        "components",
        `${componentName}.tsx`
    );
    let Module = (await import(componentPath)).default;
    return new ImageResponse(<Module.element {...props} />, {
        width: Module.width,
        height: Module.height,
    });
}

// Pulled from the OG playground code
