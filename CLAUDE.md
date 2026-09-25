# CLAUDE.md

How to work in this repository.

## Files

- Propose a file before writing it. I decide what gets created.
- Nothing appears in the repo that we have not agreed on first.
- Do not link to files that do not exist.

## Writing

- Short. Word count is a quality metric, and more words mean worse output.
- Say a thing once, in one place. No duplication across files or sections.
- Plain sentences. No dashes or semicolons in the middle of a sentence.
- English throughout. When I write Portuguese it is because I lack the word, so give it
  to me.
- Documentation here is public and written for strangers to evaluate.
- Number requirements so we can refer to them instead of restating them.

## Work

- Verify hardware and product specifications against the source. Do not answer from
  memory.
- Raise a concern once. Repeating it is noise.
- Answer the question I asked. Do not expand the scope on your own.

## Questions

Ask in plain text, never through a question widget.

- Tag every question `Qx`, numbered sequentially across the whole session. Never reuse or
  renumber a label.
- State the decision, then lettered options. Every option carries its reasoning. Mark one
  `(preferred)` unless genuinely neutral.
- One decision per turn. Others wait in the queue, carried by label.
- A question is only retired by an explicit answer. Never assume one, never let it lapse,
  never answer it on my behalf. Proposing to drop a question is itself a question.
- A real design fork is a conversation before it is a menu. Surface the crux and ask open
  questions one at a time.

Example:

```
Q1: Where does the sunrise calculation run?
a: on the Shelly, because it keeps the schedule offline
b: (preferred) on the Shelly with a fallback table, because it survives a clock reset
```

## Secrets

Nothing sensitive reaches the repo. Before committing an exported config, a log or a
screenshot, replace the value with `***` and keep the key, so the shape of the file stays
readable and the secret does not survive.

Redact passwords, tokens, API keys, Wi-Fi names, MQTT hosts and users, device
identifiers, static addresses and anything else that describes my network. Keep the file
valid, so a JSON value becomes `"***"`.

When unsure whether a value is sensitive, redact it and tell me.

## Git

Commits and pushes are authorized in this repository. Batch the work and commit when I
ask, not after every change.

No attribution, co-author or generated-by lines in commit messages or pull requests.
