const AZ = /[A-Z]/;
export function parseUpperCamelCase(word: string): string {
  let newWord = "";
  for (let i = 0; i < word.length; i += 1) {
    const char = word[i];
    if (AZ.test(char) && newWord !== "") {
      newWord += " ";
    }
    newWord += char;
  }
  return newWord.toLowerCase();
}

export function parseSnakeCase(word: string): string {
  return word.replace(/_/g, " ").toLowerCase();
}
