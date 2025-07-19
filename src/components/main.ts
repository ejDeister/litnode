import { LitNode, PubSub } from "../LiterallyHtml.ts";
import { MyComp } from "./MyComponent.ts";

export class Main extends LitNode {
    myComp: MyComp;

    constructor() {
        let counter = 0;

        const id = "main";
        const html = /*html*/`
            <div id="${id}">
                <style>
                    #${id} {
                        background-color: black;
                        color: white;
                    }
                </style>
                <h1 id="header">${counter}</h1>
                #{myComp}
            </div>
        `;
        
        const myComp = new MyComp();
        super(id, html);
        this.myComp = myComp;

        this.initFunc = () => {
          this.root!.onclick = () => {
            console.log("clicked!");
            PubSub.publishEvent("BUTTON_CLICKED");
          }
        }
        super.parseIntoNode();

        document.body.append(this.root!);

        // Experiment with state management here
        const myFunc = () => {
            counter++;
            document.getElementById("header")!.textContent = counter.toString();
        }
        PubSub.registerEvent("BUTTON_CLICKED");
        PubSub.addListener("BUTTON_CLICKED", myFunc);
        PubSub.publishEvent("MAIN_LOADED");
    }
}

PubSub.registerEvent("MAIN_LOADED");
PubSub.addListener("MAIN_LOADED", () => console.log("hi from main!"));
new Main();