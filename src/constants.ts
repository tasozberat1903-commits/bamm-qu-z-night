
export const QUIZ_QUESTIONS: any[] = [
  {
    id: 1,
    text: "Radyo Gastro Pub hangi şehirde?",
    choices: [
      { id: 'A', text: "İstanbul" },
      { id: 'B', text: "Bursa" },
      { id: 'C', text: "İzmir" },
      { id: 'D', text: "Ankara" }
    ],
    correctChoiceId: 'B',
    duration: 15
  },
  {
    id: 2,
    text: "Hangisi pub kültüründe en çok tercih edilen atıştırmalıktır?",
    choices: [
      { id: 'A', text: "Makarna" },
      { id: 'B', text: "Balık Ekmek" },
      { id: 'C', text: "Patates Kızartması" },
      { id: 'D', text: "Baklava" }
    ],
    correctChoiceId: 'C',
    duration: 15
  },
  {
    id: 3,
    text: "Radyo konseptli publarda genellikle hangi müzik türü hakimdir?",
    choices: [
      { id: 'A', text: "Rock & Nostalji" },
      { id: 'B', text: "Klasik Müzik" },
      { id: 'C', text: "Opera" },
      { id: 'D', text: "Techno" }
    ],
    correctChoiceId: 'A',
    duration: 15
  }
];

export const INITIAL_PARTICIPANTS: any[] = [
  { id: 'p1', name: "Berat", tableNumber: "12", score: 2450 },
  { id: 'p2', name: "Zeynep", tableNumber: "05", score: 2100 },
  { id: 'p3', name: "Can", tableNumber: "23", score: 1850 },
  { id: 'p4', name: "Eda", tableNumber: "08", score: 1700 },
  { id: 'p5', name: "Mert", tableNumber: "15", score: 1500 }
];
