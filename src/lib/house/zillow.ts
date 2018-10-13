export function findCategoryDetailsHomeFact(
  house: any,
  category1: string,
  category2: string,
  category3: string
): string | undefined {
  // special info is burried deep within categories/sub-categories
  const c2 = house.homeFacts.categoryDetails.find(
    (c: any) => c.categoryGroupName === category1
  );
  for (const c3 of c2.categories) {
    if (c3.categoryName !== category2) {
      continue;
    }
    return (c3.categoryFacts as any[])
      .filter((c4: any) => c4.factLabel === category3)
      .map((c5: any) => c5.factValue)
      .join(", ");
  }
}
