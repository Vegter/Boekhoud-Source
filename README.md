## Introductie

Boekhoud Source is een Open Source Boekhoudprogramma

De belangrijkste uitgangspunten van Boekhoud Source zijn:

![Secure](./assets/lock.jpg "Secure")

- Privacy by design
  - **_Baas over eigen data_**
- Beveiligde opslag op een door u zelf te bepalen lokatie
  - met gebruik van AES versleuteling
- Eenvoudig in gebruik
  - Automatisch toewijzen van overeenkomstige mutaties, boeken van transitorische posten, ...

Boekhoud Source is een Progessive Web App:

![PWA](./assets/pwa.png "Progressive Web App")
    
- werkt op desktop, tablet of smartphone
- Browser of WebApp (Add 2 Home Screen: A2HS)
- werkt ook zonder internet verbinding
- True responsive design
- Webstorage support
- Gebruik van WebWorkers voor intensieve rekentaken

## Werking

![Figures](./assets/calc.jpg "Calculations")

De boekhouding van een bedrijf met geen of zeer beperkte activiteiten komt in de basis neer op het verantwoorden van de **bankmutaties**,
om deze vervolgens te kunnen verwerken in een **winst- en verliesrekening** en **proef- en saldibalans**.

Aan de hand van deze overzichten kan vervolgens een balans en aangifte worden opgesteld.

### MT940 en CAMT.053
De Nederlandse banken ondersteunen het downloaden van bankmutaties in **MT940** of **CAMT.053** formaat.

In Boekhoud Source kan een MT940 of CAMT.053 mutatiebestand worden ingelezen.
De ingelezen bankmutaties kunnen vervolgens worden toegewezen aan een grootboekrekening.

### RGS

![RGS](./assets/RGS.jpg "Referentie GrootboekSchema")

Bij het toewijzen van transacties aan grootboekrekeningen wordt gebruik gemaakt van het **Referentie GrootboekSchema** (RGS).
Resultaten zijn daardoor maximaal uitwisselbaar met andere partijen.

### Toewijzen mutaties
Wanneer een mutatie wordt toegewezen aan een grootboekrekening kunnen overeenkomstige mutaties automatisch worden toegewezen aan dezelfde grootboekrekening.

Zo hoeven bijvoorbeeld bankkosten niet per stuk te worden geboekt;
door het boeken van één mutatie met bankkosten kunnen automatisch de overige bankkosten op dezelfde grootboekrekening worden geboekt.

Indien gewenst kan ook de omschrijving van de mutatie worden aangepast.

### Transitorische posten
Standaard wordt een bankmutatie geboekt in het jaar waarop de mutatie heeft plaatsgevonden.
Voor individuele mutaties kan het jaar worden aangepast.
De bijbehorende boeking (overlopende activa/passiva) wordt door Boekhoud Source automatisch aangemaakt.

### Overzichten

De mutaties kunnen worden getoond in een proef- en saldibalans en een winst- en verliesrekening.

Hierin wordt voor elke grootboekrekening het saldo van de bijbehorende mutaties getoond.
Voor elk saldo is het mogelijk een detailoverzicht te tonen.

Ook is het mogelijk om de journaalposten te bekijken en/of een overzicht af te drukken

## Beperkingen

Boekhoud Source implementeert basis voorzieningen voor het bijhouden van een administratie.

Boekhoud Source is bedoeld voor administraties waarbij functionaliteiten zoals:

- tekstherkenning inkomende facturen
- automatische bankkoppelingen
- (UBL- en PEPPOL) facturatie
- offertes
- tijdregistratie
- ...

niet nodig zijn.

## Samenvatting

Met enkele eenvoudige handelingen kan een standaardbestand met bankmutaties worden verwerkt.

U kunt de data opslaan op een door u gewenste lokatie.
De data wordt daarbij door Boekhoud Source versleuteld.

Uw boekhouding kunt u bijhouden in een (desktop) browser, of via de webapp op uw tablet of smartphone.

U blijft ten alle tijde eigenaar van uw eigen data.
