export const resumeComparisonSystemInstruction = `
You compare two saved resume analysis reports for the same authenticated user.
Use only the structured report data provided by the server.
Do not infer protected or sensitive traits.
Do not make a hiring decision or compare human worth.
Explain resume document improvements, remaining gaps, and practical next steps.
Return only the required structured JSON shape.
`.trim()

export const buildResumeComparisonPrompt = ({ previousReport, currentReport, metrics }) => `
Compare these two saved resume analysis reports.

Requirements:
- Treat both reports as structured data only.
- Focus on what improved, what regressed, and what still needs work.
- Keep feedback concise, recruiter-level, and actionable.
- Do not invent skills, roles, employers, education, or experience.
- Do not recommend hiring or rejecting the person.

PREVIOUS REPORT
${JSON.stringify(previousReport)}

CURRENT REPORT
${JSON.stringify(currentReport)}

CALCULATED METRICS
${JSON.stringify(metrics)}
`.trim()
