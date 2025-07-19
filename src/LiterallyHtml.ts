/**
 * 
 * A class representing an HTML node in a tree of nodes. Relies on
 * parsing string literals into HTMLElements to assemble components.
 * 
 * @field delimS, delimE The start of the delimiter used to identify 
 *          components in the HTML string literal
 * @field id The unique ID of this component used as a placeholder while
 *          the parent parses their HTML string. After parent parsing,
 *          the parent replaces the placeholder with this.root
 * @field subNodes The registry subcomponents belonging to this LitNode.
 *          Used to identify where to place subcomponents in this.root's
 *          DOM Tree
 * @field initFunc The function that runs after all LitNodes in the tree
 *          have been parsed. Runs after the root of the tree has been 
 *          appended to the document, such that subcomponents may freely
 *          access the main DOM in initFunc
 */
export class LitNode {
    private readonly delimS: string = "#{";
    private readonly delimE: string = "}";
    id: string;
    root?: HTMLElement;
    html: string;
    initFunc?: Function;
    subNodes: string[];

    static ids: Record<string, LitNode>;

    constructor(id: string, html: string = "", subNodes: string[] = []) {
        this.id = id;
        this.html = html;
        this.subNodes = subNodes;
        LitNode.ids[this.id] = this;
    }

    /**
     * Recursively parse the LitNode tree's string literals in post-order,
     * assigning the parsed node to the root node on the way up. After the
     * tree has been parsed, call each node's initFunc, again in post-order
     */
    parseIntoNode() {
        // For each token...
        let i = 0;
        while (true) {
            const ranges = this.nextRange(this.html,i);
            if (!ranges) break; // range not found

            const { tokenRange, idRange } = ranges;
            i = tokenRange[1] + this.delimE.length;

            // Recursive call on registered subNodes
            const id = this.html.slice(idRange[0], idRange[1]);
            const token = this.html.slice(tokenRange[0],tokenRange[1]);
            if (id in LitNode.ids) {
                LitNode.ids[id].parseIntoNode();
                if (!LitNode.ids[id].root) {
                    console.error(`err: subNode ${id} did not parse correctly.`)
                }
                this.html = this.html.replace(token, `<div id="${id}"></div>`);
                this.subNodes.push(id);
            }
            else {
                console.error(`err: subNode ${id} not registered.`);
            }
        }

        this.root = parseString(this.html);
        this.subNodes.forEach((id) => {
            this.root!.querySelector(`#${id}`)?.replaceWith(LitNode.ids[id].root!);
        });

        this.init();
    }

    private init() {
        this.subNodes.forEach((id) => LitNode.ids[id].init());
        if (this.initFunc) this.initFunc();
    }


    /**
     * Given a string and delimiter, return the range of the next occurrence 
     * of the start delim and end delim.
     * 
     * @param s The HTML string literal being parsed
     * @param begin The index from which we start looking for delimS
     * @returns tokenRange, idRange The starting and ending index of the token in s, 
     *          and the id within token.
     * @returns false if no more tokens remain
     */
    private nextRange(
        s: string, 
        begin: number
     ) {
        if (begin + this.delimS.length > s.length) return false;
        const tokenRange: number[] = [];

        let start = begin;
        while (s.slice(start,start+this.delimS.length) !== this.delimS) {
            start++;
            if (start + this.delimS.length > s.length) return false;
        }
        tokenRange.push(start);
        
        let end = start + this.delimS.length;
        while(s.slice(end, end+this.delimE.length) !== this.delimE) {
            end++;
            if (end + this.delimE.length > s.length) return false;
        }
        tokenRange.push(end+this.delimE.length);
        
        const idRange = [tokenRange[0]+this.delimS.length, tokenRange[1]-this.delimE.length];
        return { tokenRange, idRange };
    }
}

/**
 * Parse an html string literal into an HTMLElement
 * 
 * @param html A string literal containing only HTML and JS tokens, e.g. ${5+10}.
*              Does not contain references to LitNodes, e.g. #{myComponent}
 * @returns HTMLElement A node from using a DOM Parser on the html string literal
 */
const parseString = (html: string) => {
    return (new DOMParser()).parseFromString(html, 'text/html').body.firstElementChild as HTMLElement;
}


/**
 * A basic Publisher/Subscriber system for listening to user-defined events.
 * 
 * Usage follows the flow: 
 * 1. Register a string name for a type of event e.g. "BUTTON_CLICKED", similar to an enum
 * 2. (Publisher) Everywhere in your code where the condition for the event is met, call publishEvent with the event name 
 * 3. (Subscriber) Everywhere in your code you want to react to the event, define a function and register it with addListener
 * 4. If you want to unregister a subscriber, call deleteListener() with the event name and function signature.
 */
export class PubSub {
    // currently uses numbers as keys in case I want to switch to enums
    private static listeners: Record<string, Set<Function>> = {};
    private static events: Set<string> = new Set();

    static registerEvent(event: string) {
        PubSub.events.add(event);
        PubSub.listeners[event] = new Set();
    }

    static addListener(e: string, func: Function) {
        if (!PubSub.events.has(e)) {
            console.error("err: event not registered");
            return;
        }; 
        PubSub.listeners[e].add(func);
    }

    static deleteListener(e: string, func: Function) {
        if (!PubSub.events.has(e)) {
            console.error("err: event not registered");
            return;
        }
        PubSub.listeners[e].delete(func);
    }

    static publishEvent(e: string, payload?: any) {
        if (e in PubSub.listeners) {
            PubSub.listeners[e].forEach((func) => {
                try {
                    func(payload)
                }
                catch(error) {
                    console.error(`${func} caused error: ${error}`);
                }
            });
        }
    }
}