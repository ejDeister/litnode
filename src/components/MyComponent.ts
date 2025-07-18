import { LitNode } from "../LitNode.ts";

export class MyComp extends LitNode {
    constructor() {
        const id = "myComp";
        const html = `
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
