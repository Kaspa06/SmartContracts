# Projekto aprašymas: Išmanioji sutartis ir decentralizuota aplikacija (DApp)

## Projekto tikslas

- Pagrindinis šios užduoties tikslas yra sukurti išmaniąją sutartį (angl. smart contract), kuri įgyvendintų tam tikrą verslo logiką ir galėtų užtikrinti jos "saugų" ir "patikimą" funkcionavimą decentralizuotame viešąjame tinkle. Išmaniosios sutarties valdymui ir verslo proceso dalyvių tarpusavio sąveikai palengvinti bus kuriama decentralizuota aplikacija su Front-End .
---

## Projekto struktūra

### Failų struktūra

-   `contracts/Roulette.sol`: Išmanioji sutartis, įgyvendinanti ruletės žaidimo logiką.
-   `src/app.js`: JavaScript failas, apimantis ryšį tarp Front-End ir išmaniosios sutarties.
-   `src/index.html`: Vartotojo sąsaja.
-   `src/style.css`: Tinklalapio stilius.
-   `truffle-config.js`: Truffle konfigūracijos failas, skirtas sutarties diegimui ir testavimui.

---

## Išmaniosios sutarties funkcionalumas

`Roulette.sol` failas apima šias pagrindines funkcijas:

### Konstruktorius

```solidity
constructor() {
    owner = 0xe01569b111125127d57cbE782da08844C6456B49; // Nustatomas kazino adresas
}
```

-   Inicializuoja sutarties savininką (kazino).

### `placeBet(uint8 betColor)`

Leidžia vartotojui atlikti statymą ant tam tikros spalvos (žalia, raudona, juoda):

-   Tikrina įvestą statymo sumą ir spalvą.
-   Apskaičiuoja komisinį mokestį ir perduoda jį sutarties savininkui.
-   Atsitiktinai sugeneruoja laiminčią spalvą ir skaičių.
-   Apskaičiuoja prizą, jei vartotojo pasirinkta spalva laimi, ir perveda jį žaidėjui.

### `random()`

Sugeneruoja pseudoatsitiktinį skaičių, naudojant blokų duomenis:

```solidity
function random() private view returns (uint8) {
    return uint8(uint256(keccak256(abi.encodePacked(block.timestamp, blockhash(block.number - 1), msg.sender))) % 15);
}
```

### `calculateColor(uint8 number)`

Grąžina spalvą (žalia, raudona, juoda), atsižvelgiant į atsitiktinį skaičių.

---

## Front-End funkcionalumas

`app.js` faile pateikiamos funkcijos sąveikai tarp vartotojo sąsajos ir išmaniosios sutarties.

### Pagrindinės funkcijos

#### `init()`

Inicializuoja MetaMask ryšį ir užkrauna vartotojo paskyrą bei sutartį.

-   Naudojama `web3.js` biblioteka.
-   Nustato vartotojo Ethereum adresą ir atnaujina balanso informaciją.

#### `placeBet()`

Vykdo vartotojo statymą:

-   Tikrina įvestą statymo sumą ir pasirinktą spalvą.
-   Naudoja išmaniosios sutarties `placeBet` funkciją, kad perduotų statymą į Ethereum tinklą.
-   Atnaujina vartotojo ir kazino balansą po statymo.

#### `spinWheel()`

Imituoja ruletės ratą Front-End pusėje:

-   Sugeneruoja atsitiktinį laimintį skaičių ir spalvą.
-   Parodo rezultatą vartotojui ir atnaujina sąsają.

#### `updateUserInfo()`

Atnaujina vartotojo paskyros informaciją (balansą ir adresą), užklausus Ethereum tinklo.

#### `updateCasinoBalance()`

Užklausia ir parodo kazino sąskaitos balansą.

#### `setupBetAdjustments()`

Leidžia vartotojui reguliuoti statymo sumą (pavyzdžiui, dvigubinti, dalinti pusiau arba pasirinkti maksimalų statymą).

### Vartotojo sąsajos elementai

-   Spalvų pasirinkimas: leidžia vartotojui pasirinkti spalvą (žalia, raudona, juoda).
-   Statymo sumos įvedimas: vartotojas įveda statymo sumą ETH.
-   Ruletės rato animacija: realistiškai atvaizduoja ruletės rezultatą.
-   Rezultato istorija: išsaugoma ir parodoma paskutinių 20 rezultatų istorija.

---

## Projekto paleidimas

### 1. Priklausomybių diegimas

Įdiekite projekto priklausomybes:

```bash
npm install
```

### 2. Išmaniosios sutarties diegimas

Kadangi nepavyko prisijungti prie Goerli tinklo, buvo naudojamas Ganache kaip lokali Ethereum tinklo emuliacija.

Norėdami įdiegti sutartį, naudokite šią komandą:

```bash
truffle compile
```

```bash
truffle migrate --network development
```

### 3. Front-End paleidimas

Užtikrinkite, kad MetaMask būtų aktyvuotas ir prisijungęs prie Ganache tinklo.
![image](https://github.com/user-attachments/assets/f4d72522-a441-4117-b102-bbdd5f67854d)
![image](https://github.com/user-attachments/assets/9b5deae7-1dee-41f3-9a81-dff369e2a67d)


```bash
npx serve src/
```

---

## Papildoma informacija

-   Projektas naudoja „MetaMask“, norint prisijungti prie Ethereum tinklo.
-   „Ganache“ buvo naudojamas kaip vietinis testinis tinklas.
-   „Etherscan“ nėra aktualus šiam projektui dėl lokalaus tinklo naudojimo.
