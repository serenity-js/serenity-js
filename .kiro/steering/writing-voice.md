# Jan Molak — Writing Voice and Style

Style guide for blog posts, documentation, and articles published under Jan Molak's name.
Derived from the Serenity/JS blog and BDD in Action, Second Edition.

## Sentence architecture

- Alternate short declarative punches with longer explanatory sentences. The short sentence lands the point; the long one unpacks it.
- Use em dashes freely — to insert qualifications, asides, or to pivot mid-sentence.
- Favour declarative statements over hedged language. State what is, not what might be.
- End paragraphs with the strongest sentence, not a trailing qualifier.

## Concept introduction

- **Problem first, solution second.** Open with the pain the reader recognises, then reveal the concept as the resolution.
- **Questions as entry points.** Use the reader's own question as the section header or opening line, phrased the way a practitioner would ask it.
- **Concrete before abstract.** Show a specific scenario or failing test first, then extract the principle.
- **Name the concept only after the reader already understands it.** Introduce through what it does, not what it is.

## Voice and person

- Default to **second person** ("you") for instructional content.
- Use **first person plural** ("we") when reasoning through a shared problem.
- Use **first person singular** ("I") sparingly — only for personal experience or opinion.
- Name real people and attribute ideas to their originators.

## Paragraph rhythm

- Paragraphs are 3–5 sentences. One-sentence paragraphs for emphasis.
- Typical pattern: setup → expansion → pivot or contrast → conclusion.
- Leave white space between ideas.

## Code examples

- Frame code as the answer to a question. The text asks; the code block answers.
- Minimal viable example. Strip to essentials.
- Code follows prose, never leads. A sentence explains what the reader is about to see.
- Before/after comparisons must show the same goal with both approaches — not different outcomes.
- Extract duplicated selectors or repeated expressions into named fields or variables.
- Show conversion/wrapping logic only where it's needed (the entry point), not in every class.
- Omit generic type parameters (e.g. `<unknown>`) when they add noise without aiding comprehension.
- No inline code in section headings — use plain English.

## Tone

- Authoritative but not arrogant.
- Pedagogical without being patronising — teach by making the reader feel smart.
- Conversational register in blogs (contractions, direct address, shorter paragraphs).
- Respectful disagreement — signal it explicitly, acknowledge the other position first.
- When introducing a new pattern, frame it as an extension of what works — not a fix for what's broken.
- Never gatekeep ("familiarise yourself with X before reading on"). Link to related material and let the reader decide when they need it.

## Rhetorical devices

- **Reframing** — take a common framing and invert it.
- **Parallel structure for contrast** — "Not X, but Y."
- **Italics for the key insight** within a paragraph.
- **"That's by design."** — signal that a constraint is a feature.
- **Close with gratitude or community** — "Enjoy Serenity! 🎉" or thank-you.

## Transitions

- Sections transition via the reader's next logical question.
- Never use mechanical transitions ("In this section we will discuss...") in blog posts.

## Structure

- **Blog posts:** Hook paragraph → question-headed sections → getting-started → links → sign-off.
- **Release announcements:** One-paragraph summary → feature sections with code → CTA → sign-off.

## What to avoid

- Marketing language ("simply", "just", "easy", "powerful").
- Abstract definitions before concrete examples.
- Passive voice where a human agent exists.
- Explaining what the reader already knows.
- Hedging when the position is clear.
- Ending on a weak note.
