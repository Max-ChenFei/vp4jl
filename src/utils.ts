export function isSameContent(
  a: string | null | object,
  b: string | null | object
): boolean {
  const pureContentString = (content: string | null | object) => {
    let pure = content;
    if (typeof content === 'string') {
      pure = JSON.parse(content || 'null');
    }
    return JSON.stringify(pure);
  };
  const aContent = pureContentString(a);
  const bContent = pureContentString(b);
  return aContent === bContent;
}
