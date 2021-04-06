/**
 * TreeView
 *
 * Elementary treeView support
 */

interface TreeViewProps {
    open: string[],     // All node id's that are explicitly opened
    close: string[],    // All node id's that are explicitly closed
    levels: number[]    // All levels that are open
}

export class TreeView implements TreeViewProps {
    open: string[]
    close: string[]
    levels: number[]

    constructor(props: TreeViewProps) {
        const { open, close, levels } = props
        this.open = open
        this.close = close
        this.levels = levels
    }

    /**
     * Tells whether the node with the given id and level is open (has any children below)
     */
    isNodeOpen(node: Omit<TreeViewNode, "parentId">): boolean {
        const { id, level } = node
        if (this.open.includes(id)) {
            // Explicitly opened
            return true
        } else if (this.close.includes(id)) {
            // Explicitly closed
            return false
        } else {
            // Implicit visibility
            return this.levels.includes(level) && this.levels.includes(level + 1)
        }
    }

    /**
     * Opens a node when it is closes and vice versa
     */
    toggleOpenClose(node: Omit<TreeViewNode, "parentId">): {
        open: string[],
        close: string[]
    } {
        const { id, level } = node
        const implicitlyOpen = this.levels.includes(level + 1)
        
        const reset = (ids: string[]) => ids.filter(i => i.indexOf(id) !== 0)

        if (this.isNodeOpen(node)) {
            // Close id
            this.open = reset(this.open)          // clear any open ids or children or id
            this.close = implicitlyOpen
                    ? [...reset(this.close), id]  // reset children, close account explicitly
                    : reset(this.close)           // simply reset account and children, account will close automatically
        } else {
            // Open id
            this.open = implicitlyOpen
                ? this.open                       // already implicitly open, do not change open
                : [...this.open, id]              // explicitly open
            this.close = reset(this.close)        // unclose account and any children
        }
        return {
            open: this.open,
            close: this.close
        }
    }

    /**
     * Tells whether the node with the given id, parentId and level is visible in the treeView
     */
    isNodeVisible(node: TreeViewNode): boolean {
        const { id, parentId, level } = node
        if (this.open.includes(id) ||                   // Explicitly opened
            this.close.includes(id) ||                  // Explicitly closed (show to be able to re-open)
            (parentId && this.open.includes(parentId))  // Opened by parent
        ) {
            return true
        } else if (this.close.some(c => id.indexOf(c) === 0)) {
            return false                                // Closed by parent
        } else {
            // Default or implicit behaviour
            return this.levels.includes(level)          // Level is visible
        }
    }
}

export interface TreeViewNode {
    id: string,
    parentId: string | null,
    level: number
}
