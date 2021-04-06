import { reverseData, VATDeclaration, VATDeclarationTag } from "./VATDeclaration"
import { Mocked } from "../mocks"
import { VATSpecificationData } from "../../model"
import { VATDeclarationPeriod } from "./VATDeclarationPeriod"
import { Accounting } from "../Accounting"
import { VATLine } from "./VATLine"
import { VATRates } from "./VATRates"
import { VAT_HIGH, VAT_LOW, VATHistory } from "./VATHistory"
import { DateString } from "../DateString"
import { JournalEntry } from "../Journal/JournalEntry"
import { Amount } from "../Amount"
import { NO_VAT } from "./VATRate"

test("VAT Declaration", () => {
    let mocked = new Mocked()

    const accounting = new Accounting(mocked.state)

    let date = new DateString("2020-01-01")
    let rates = new VATRates(date.Date).rates

    let journal = accounting.journal

    // LOW VAT = 18
    let vatLowLine = new VATLine(rates[VAT_LOW], 218)   // VAT 2 * 9 = 18
    let vatLowSpec: VATSpecificationData = {
        date: date.toString(),
        lines: [vatLowLine.data]
    }
    let lowEntry = new JournalEntry({...mocked.journalEntryData, id: "low"})
    lowEntry.oppositeLeg.data.amountData = Amount.fromAmountCurrency(-218, "CUR").data
    lowEntry.allocatedLeg.data.amountData = Amount.fromAmountCurrency(218, "CUR").data
    lowEntry.setVAT(vatLowSpec)
    journal.add(lowEntry)

    // HIGH VAT = 21
    let vatHighLine = new VATLine(rates[VAT_HIGH], 126) // Round down: VAT 21.87 => 21
    let vatHighSpec: VATSpecificationData = {
        date: date.toString(),
        lines: [vatHighLine.data]
    }
    let highEntry = new JournalEntry({...mocked.journalEntryData, id: "high"})
    highEntry.oppositeLeg.data.amountData = Amount.fromAmountCurrency(-126, "CUR").data
    highEntry.allocatedLeg.data.amountData = Amount.fromAmountCurrency(126, "CUR").data
    highEntry.setVAT(vatHighSpec)
    journal.add(highEntry)

    // PAID VAT = 21
    vatHighLine = new VATLine(rates[VAT_HIGH], -116) // Round up: VAT 20.13 => 21
    vatHighSpec = {
        date: date.toString(),
        lines: [vatHighLine.data]
    }
    let paidEntry = new JournalEntry({...mocked.journalEntryData, id: "paid"})
    paidEntry.oppositeLeg.data.amountData = Amount.fromAmountCurrency(116, "CUR").data
    paidEntry.allocatedLeg.data.amountData = Amount.fromAmountCurrency(-116, "CUR").data
    paidEntry.setVAT(vatHighSpec)
    journal.add(paidEntry)

    let period = new VATDeclarationPeriod(2020, 2)
    let declaration = new VATDeclaration(journal, period)
    declaration.getDeclarationDocument()
    expect(declaration.total).toEqual(0)

    period = new VATDeclarationPeriod(2020, 1)
    declaration = new VATDeclaration(journal, period)
    const document = declaration.getDeclarationDocument()

    expect(document["5. Voorbelasting, kleineondernemersregeling,schatting en eindtotaal"]
                   ["5a Verschuldigde omzetbelasting"].vat).toEqual(39)
    expect(document["5. Voorbelasting, kleineondernemersregeling,schatting en eindtotaal"]
                   ["5b Voorbelasting"].vat).toEqual(-21)
    expect(document["5. Voorbelasting, kleineondernemersregeling,schatting en eindtotaal"]
                   ["5c Subtotaal"].vat).toEqual(18)
    expect(declaration.total).toEqual(18)   // VAT to be paid
    expect(declaration.currency).toEqual("CUR")

    expect(VATDeclaration.getManualId("1a whatever")).toEqual(VATDeclarationTag.High)
    expect(VATDeclaration.getManualId("1b whatever")).toEqual(VATDeclarationTag.Low)
    expect(VATDeclaration.getManualId("1d whatever")).toEqual(VATDeclarationTag.PrivateUse)
    expect(VATDeclaration.getManualId("5b whatever")).toEqual(VATDeclarationTag.Paid)
    expect(VATDeclaration.getManualId("whatever")).toBeUndefined()

    expect(VATDeclaration.isExpenseCategory("1a whatever")).toEqual(false)
    expect(VATDeclaration.isExpenseCategory("5b whatever")).toEqual(true)
    expect(VATDeclaration.isExpenseCategory("whatever")).toEqual(false)

    let declarationVAT = VATHistory["2019-01-01"]
    expect(declaration.getVATRate("1a whatever")).toEqual(declarationVAT[0])
    expect(declaration.getVATRate("1b whatever")).toEqual(declarationVAT[1])
    expect(declaration.getVATRate("1d whatever")).toEqual(NO_VAT)
    expect(declaration.getVATRate("5b whatever")).toEqual(NO_VAT)
    expect(declaration.getVATRate("whatever")).toEqual(NO_VAT)

    // Constructor tests
    let manualVATs = declaration.manualVATs
    let newDeclaration = new VATDeclaration(journal, period, manualVATs)
    expect(newDeclaration.manualVATs).toEqual(manualVATs)

    // Private Use - Manual VAT

    let manualPrivUse = {
        id: "",
        bruto: "0",
        vat: "100.00",
        netto: "0"
    }

    newDeclaration.setManualVAT("1d", manualPrivUse)
    let journalEntry = JournalEntry.fromVATDeclaration(newDeclaration)
    let privUseLeg = journalEntry.getLeg(VATDeclarationTag.PrivateUse)
    expect(privUseLeg!.amount.value).toEqual(-100)

    journal.add(journalEntry)
    newDeclaration = new VATDeclaration(journal, period)
    expect(newDeclaration.manualVATs["Prive gebruik"]).toEqual(manualPrivUse)

    // Expenses - Manual VAT

    period = new VATDeclarationPeriod(2020, 2)
    declaration = new VATDeclaration(journal, period)
    declaration.getDeclarationDocument()
    expect(declaration.total).toEqual(0)

    let manualPaid = {
        id: "",
        bruto: "100",
        vat: "21",
        netto: "121"
    }

    declaration.setManualVAT("5b", manualPaid)
    journalEntry = JournalEntry.fromVATDeclaration(declaration)
    let leg = journalEntry.getLeg(VATDeclarationTag.Paid)
    expect(leg!.amount.value).toEqual(21)

    expect(declaration.declaredAmount(journalEntry, VATDeclarationTag.Paid)).toEqual(21)
    expect(declaration.declaredAmount(journalEntry, VATDeclarationTag.High)).toEqual(0)
    expect(declaration.declaredAmount(journalEntry, VATDeclarationTag.Low)).toEqual(0)

})

test("Utility functions", () => {
    let data = {
        id: "",
        bruto: "100",
        vat: "21",
        netto: "121"
    }
    let reversedData = {
        id: "",
        bruto: "-100",
        vat: "-21",
        netto: "-121"
    }
    expect(reverseData(data)).toEqual(reversedData)
    expect(reverseData(reversedData)).toEqual(data)
    data = {
        id: "",
        bruto: "0",
        vat: "0",
        netto: "0"
    }
    expect(reverseData(data)).toEqual(data)
})
