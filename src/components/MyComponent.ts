import { LitNode } from "../LiterallyHtml.ts";

export class MyComp extends LitNode {
    constructor() {
        const id = "myComp";
        const html = /*html*/`
            <div id="${id}">
                <p>Hi from myComp!</p>
            </div>
        `;
        super(id, html);

        this.initFunc = () => {
            this.root!.onclick = () => {
                console.log("clicked also!");
            };

        }

        super.parseIntoNode();
    }
}
