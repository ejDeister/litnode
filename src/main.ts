import { LitNode } from "./LitNode.ts";
import { MyComp } from "./components/MyComponent.ts";

export class Main extends LitNode {
    constructor() {
        const id = "main";
        const html = `
            <div id="${id}">
                <style>
                    #${id} {
                        background-color: black;
                        color: white;
                    }
                </style>
                <h1>Hi from main!</h1>
                #{myComp}
            </div>
        `;
        const myComp = new MyComp();
        const subNodes: Record<string, LitNode> = {
            myComp: myComp,
        };
        super(id, html, subNodes);

        this.initFunc = () => {
          this.root!.onclick = () => {
            console.log("clicked!");
          }
        }
        super.parseIntoNode();

        document.body.append(this.root!);
    }
}
new Main();