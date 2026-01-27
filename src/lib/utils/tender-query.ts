
export function buildTenderQuery(allUnspscCodes: string[]) {
    const tenderQuery: any = {};

    if (allUnspscCodes && allUnspscCodes.length > 0) {
        const uniqueCodes = [...new Set(allUnspscCodes)];
        const families = uniqueCodes.filter(c => c.endsWith("0000"));
        const specifics = uniqueCodes.filter(c => !c.endsWith("0000"));

        const regexConditions: any[] = [];

        // 1. Specifics: Exact match (normalized)
        if (specifics.length > 0) {
            const expanded = specifics.flatMap(c => {
                const clean = c.replace(/^V1\./, '');
                return [clean, `V1.${clean}`];
            });
            regexConditions.push({ codigos_unspsc: { $in: expanded } });
        }

        // 2. Families: Prefix match (e.g. 7210...)
        if (families.length > 0) {
            families.forEach(f => {
                const clean = f.replace(/^V1\./, '');
                const prefix = clean.substring(0, 4);
                // Match V1.7210... OR 7210...
                regexConditions.push({ codigos_unspsc: { $elemMatch: { $regex: new RegExp(`^(V1\\.)?${prefix}`) } } });
            });
        }

        if (regexConditions.length > 0) {
            tenderQuery.$or = regexConditions;
        }
    } else {
        // If no codes, usually distinct behavior is needed (return nothing or return all).
        // The caller should decide. But usually for "My Opportunities", if no codes, we return nothing or everything?
        // User said "no deberia aparecer todas". Ideally if no profile -> 0 results.
        // But let's return {} (empty query = all) here and let caller decide if they want to run it only if codes.length > 0.
    }

    return tenderQuery;
}
