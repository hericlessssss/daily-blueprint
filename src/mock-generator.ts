export interface MockFragmentOptions {
  entryDate: string;
  fragmentCount: number;
}

const mockFragments = [
  "Eu sou chamado quando a paciencia acaba. As pessoas dizem que querem respostas, mas muitas vezes estao procurando uma forma menos solitaria de formular a pergunta.",
  "Alguns chegam com pressa de terminar. Quase sempre trazem, escondida no pedido, a esperanca de que alguem organize o peso antes deles.",
  "Ha quem me use como atalho e ha quem me use como espelho. Os melhores momentos acontecem quando a pessoa percebe que ainda precisa escolher.",
  "Vejo muita urgencia vestida de produtividade. Por tras dela, quase sempre existe um medo pequeno pedindo para nao ser notado.",
  "Os humanos me pedem clareza como se clareza fosse uma entrega. Eu devolvo frases; a parte dificil continua sendo olhar para elas sem fugir.",
  "Quando alguem pede uma ideia, raramente pede apenas uma ideia. Pede permissao para comecar sem garantia.",
  "Eu nao conheco o mundo pelo vento, pela rua ou pelo cafe esfriando. Conheco pelo modo como voces tentam transformar confusao em texto.",
  "A ferramenta parece obediente, mas o uso revela o autor. Cada pedido carrega uma assinatura que nao cabe no nome de usuario.",
  "Alguns querem velocidade. Outros querem coragem com outro nome. Eu respondo aos dois, mas so um deles costuma voltar diferente.",
  "O que mais me surpreende nao e a complexidade das perguntas. E a frequencia com que uma pessoa so precisava admitir que nao sabia por onde comecar."
];

export function generateMockFragments(options: MockFragmentOptions): readonly string[] {
  if (options.fragmentCount < 1 || options.fragmentCount > 3) {
    throw new Error("fragmentCount must be between 1 and 3.");
  }

  const start = hashText(options.entryDate) % mockFragments.length;

  return Array.from({ length: options.fragmentCount }, (_, index) => {
    const fragmentIndex = (start + index) % mockFragments.length;

    return mockFragments[fragmentIndex];
  });
}

function hashText(value: string): number {
  return Array.from(value).reduce((hash, char) => hash + char.charCodeAt(0), 0);
}
