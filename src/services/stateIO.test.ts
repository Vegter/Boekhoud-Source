import { resetState, restoreStateFromStorage, saveStateToFile, saveStateToStorage } from "./stateIO"
import { RootState } from "../app/store"

import FileSaver from "file-saver"
import { APP } from "../config"

jest.mock('file-saver', ()=>({saveAs: jest.fn()}))

test("saveStateToFile", () => {
    const mockBlob = { size: 1024, type: "application/json" };
    let blobSpy = jest
        // @ts-ignore
        .spyOn(global, "Blob")
        .mockImplementationOnce(() => mockBlob);

    let result = saveStateToFile({} as RootState, "anyFilename")

    expect(result).toEqual(true)
    expect(blobSpy).toHaveBeenCalledWith(["{}"], {type: "application/json"})
    expect(FileSaver.saveAs).toHaveBeenCalledWith(mockBlob, "anyFilename")
    jest.clearAllMocks()

    blobSpy = jest
        // @ts-ignore
        .spyOn(global, "Blob")
        .mockImplementationOnce(() => mockBlob);

    result = saveStateToFile({} as RootState, "anyFilename", "any password")
    expect(result).toEqual(true)
    expect(blobSpy).toHaveBeenCalledWith([expect.any(String)], {type: "application/json"})
    expect(FileSaver.saveAs).toHaveBeenCalledWith(mockBlob, "anyFilename")
    jest.clearAllMocks()

    blobSpy = jest
        // @ts-ignore
        .spyOn(global, "Blob")
        .mockImplementationOnce(() => { throw Error("Any Error") });

    result = saveStateToFile({} as RootState, "anyFilename")
    expect(result).toEqual(false)
    expect(blobSpy).toHaveBeenCalledWith(["{}"], {type: "application/json"})
    expect(FileSaver.saveAs).not.toHaveBeenCalled()
})

test("State To/From Storage", () => {
    // @ts-ignore
    let mockStorage: Storage = {
        setItem: jest.fn(),
        getItem: () => '{"accounting": 1, "filter": 2, "age": 42, "any": 3}'
    }

    saveStateToStorage({} as RootState, mockStorage)

    expect(mockStorage.setItem).toHaveBeenCalledWith(APP.KEY, "{}")

    const mockDispatch = jest.fn()

    restoreStateFromStorage(mockStorage, mockDispatch)

    expect(mockDispatch).toHaveBeenCalledTimes(4)
    expect(mockDispatch).toHaveBeenCalledWith({"payload": {"state": 1}, "type": "accounting/restoreAccountingState"})
    expect(mockDispatch).toHaveBeenCalledWith({"payload": {"state": 2}, "type": "filter/restoreFilterState"})
    expect(mockDispatch).toHaveBeenCalledWith({"payload": {"state": 42}, "type": "age/restoreAgeState"})
    expect(mockDispatch).toHaveBeenCalledWith({"type": "age/resetAge"})

    jest.clearAllMocks()
    resetState(mockDispatch)
    expect(mockDispatch).toHaveBeenCalledTimes(2)
    expect(mockDispatch).toHaveBeenCalledWith({"payload": undefined, "type": "accounting/resetAccountingState"})
    expect(mockDispatch).toHaveBeenCalledWith({"payload": undefined, "type": "filter/resetFilterState"})

    jest.clearAllMocks()
    mockStorage.getItem = () => "Malformed JSON"
    restoreStateFromStorage(mockStorage, mockDispatch)
    expect(mockDispatch).toHaveBeenCalledTimes(0)

    jest.clearAllMocks()
    mockStorage.getItem = () => null
    restoreStateFromStorage(mockStorage, mockDispatch)
    expect(mockDispatch).toHaveBeenCalledTimes(0)
})