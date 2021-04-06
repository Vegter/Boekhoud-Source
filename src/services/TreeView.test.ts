import { TreeView, TreeViewNode } from "./TreeView"

test("TreeView", () => {
    let tv: TreeView
    // 1
    //   2a
    //       3a
    //       3b
    //           4
    //   2b
    let nodes: TreeViewNode[] = [
        { id: "1", parentId: null, level: 1},   // 0
        { id: "12a", parentId: "1", level: 2},   // 1
        { id: "12a3a", parentId: "2a", level: 3},  // 2
        { id: "12a3b", parentId: "2a", level: 3},  // 3
        { id: "12a3a4", parentId: "3a", level: 4},   // 4
        { id: "12b", parentId: "1", level: 2},   // 5
    ]

    tv = new TreeView({open: [], close: [], levels: []})

    expect(tv.isNodeOpen(nodes[0])).toEqual(false)
    expect(tv.isNodeVisible(nodes[0])).toEqual(false)
    tv.toggleOpenClose(nodes[0])
    expect(tv.isNodeOpen(nodes[0])).toEqual(true)
    expect(tv.isNodeVisible(nodes[0])).toEqual(true)

    tv = new TreeView({open: [], close: [], levels: [1, 2]})
    nodes.filter(n => n.level <= 2).forEach(n => {
            expect(tv.isNodeOpen(n)).toEqual(n.level === 1)
            expect(tv.isNodeVisible(n)).toEqual(true)
        })
    nodes.filter(n => n.level > 2).forEach(n => {
            expect(tv.isNodeOpen(n)).toEqual(false)
            expect(tv.isNodeVisible(n)).toEqual(false)
        })

    tv.toggleOpenClose(nodes[1])
    nodes.filter(n => n.parentId === "2a").forEach(n => {
            expect(tv.isNodeOpen(n)).toEqual(false)
        })
    tv.toggleOpenClose(nodes[1])
    expect(tv.close).toEqual([])
    expect(tv.open).toEqual([])

    tv.toggleOpenClose(nodes[0])
    expect(tv.close).toEqual(["1"])
    expect(tv.open).toEqual([])
    expect(tv.isNodeOpen(nodes[0])).toEqual(false)
    nodes.filter(n => n.level > 1).forEach(n => {
        expect(tv.isNodeVisible(n)).toEqual(false)
    })

    tv.toggleOpenClose(nodes[0])
    expect(tv.isNodeOpen(nodes[0])).toEqual(true)
})