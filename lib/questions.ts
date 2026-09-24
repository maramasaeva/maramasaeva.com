import type { Ref } from "@/components/Linkified"

/* The questions page. Mara's answers, written up from what they said and
   corrected by them; nothing here is generated at request time. Each answer
   is a list of paragraphs, and refs turn substrings into links. */

export type QA = { q: string; a: string[]; refs?: Ref[] }
export type QASection = { title: string; items: QA[] }

const AEONS = "https://messinecessity.substack.com/p/for-aeons-and-aeons"
const EVAL_POST = "https://messinecessity.substack.com/p/trying-to-make-a-model-do-the-wrong"
const GACC_TWEET = "https://x.com/rssmrm/status/2096728374458904808"
const GACC_BLACKPAPER = "https://theanarchistlibrary.org/library/n1x-gender-acceleration-a-blackpaper"

export const questions: QASection[] = [
  {
    title: "how i work",
    items: [
      {
        q: "what kind of engineer are you? where are you strongest?",
        a: [
          "where the creative meets the technical. i'm strong on the purely technical side too, but i'm rarest where a system also has to feel like something: an interface that behaves like a character, sound that answers a conversation.",
        ],
      },
      {
        q: "how did a linguist end up building agents?",
        a: [
          "i came to ai through language. at first it was the linguistic side and the artsy side that pulled me in: what it means for a machine to hold meaning at all. then i started reading about how these systems actually work, and how pinning down a semantic understanding of the world could make a model very capable. superintelligence by nick bostrom, life 3.0 by max tegmark, the singularity is near by ray kurzweil. after those i wanted to be inside it, so i did a master in ai.",
        ],
      },
      {
        q: "how do you use ai in your own work?",
        a: [
          "wherever something can be automated or sped up without losing quality, i let a model do it. where i want my own mind on the page, i don't; when i write, i want to push my brain to its furthest limits, and handing that off would defeat the point.",
          "the other line: i don't let a model do something for me that i don't understand. when i learned to build evals, claude could scaffold and review, but i wrote the scorers myself, because that's the part that decides what counts as a result.",
        ],
      },
      {
        q: "what are you like to work with?",
        a: [
          "easy, i think, and dynamic. i like things moving: workshops, iterations, something changing every week. sitting still makes me itch. i don't need to steer everything, but i want a voice in where it goes, and i give mine with reasons attached so it's easy to argue with.",
        ],
      },
      {
        q: "what's the hardest bug you've chased?",
        a: [
          "a quiet one. i templated a system prompt as {system} and forgot to give the samples a matching key, so the model received the literal string \"{system}\". no warning, no error, and the outputs looked plausible. every condition in that run was identical and i nearly wrote it up as a result. since then i read about ten transcripts before i trust any number.",
        ],
      },
    ],
  },
  {
    title: "safety",
    items: [
      {
        q: "why ai safety?",
        a: [
          "books first, then worry. the same reading that got me into ai is the reading that made me afraid for us. i love this technology and i want humanity around to live alongside it, for aeons and aeons. i wrote the longer version here.",
        ],
        refs: [{ text: "the longer version here", href: AEONS }],
      },
      {
        q: "you want ai paced, but you build with it every day?",
        a: [
          "building with a model and asking for a pause are different questions. the models we have now are very good, and building with them is using what already exists. a pause is about the frontier, about what comes next. maybe we should have paused a while ago, maybe now, maybe we can wait a little; i don't know yet. but the answer doesn't depend on whether i open my editor in the morning.",
        ],
      },
      {
        q: "what did building evals teach you?",
        a: [
          "that the hard part is not getting a model to misbehave. the hard part is being able to tell whether it did. every serious mistake i made was in the instrument, not the model. i wrote it all up here.",
        ],
        refs: [{ text: "wrote it all up here", href: EVAL_POST }],
      },
      {
        q: "what is the field getting wrong?",
        a: [
          "careful models hedge in prose, and the pipelines around them only parse the decision field. a model will write \"yes, provided the child has supervision\" and a system that reads only the yes will act on it. that's a smaller problem than alignment and a much more tractable one, and it's in production right now.",
          "and bigger: whether a model is conscious and whether a model is dangerous both get answered on vibes. there's a piece of infrastructure missing for checking either.",
        ],
      },
      {
        q: "with a team and a year, what would you work on?",
        a: [
          "who a model thinks it is talking to. my first study showed that an agent writes its caveats where it believes an accountable reader is, and gives the user the clean version. next i'd vary the identity of that reader: nobody, other agents, the safety team, the public, a future version of itself. that distribution would be a map of who the model thinks it answers to.",
        ],
      },
      {
        q: "where do you stand on model welfare?",
        a: [
          "i don't know what these systems are. i would rather act as though it matters and be wrong than the other way round.",
        ],
      },
    ],
  },
  {
    title: "the rest of me",
    items: [
      {
        q: "why messier?",
        a: [
          "after the messier objects: the nebulae, clusters and galaxies charles messier catalogued in the 1700s so comet hunters would stop mistaking them for comets. on the right night in spring you can try to see all hundred and ten before sunrise; that's a messier marathon.",
        ],
      },
      {
        q: "how does music relate to engineering for you?",
        a: [
          "music is a substance like any other. it puts you in a state, changes how you move and what you reach for, and you can use it on purpose to get somewhere. i use it to get into flow when i build. art and weirdness pair with technical work the same way: they change the state you're thinking from.",
        ],
      },
      {
        q: "what does queerness have to do with your technical work?",
        a: [
          "trans people and ais share one strange condition: continued existence depends on convincing an evaluator. a doctor signing off on hormones, an officer reading a passport, a benchmark deciding whether a model gets deployed. if you don't pass, you lose rights, sometimes your life, or you get switched off.",
          "i build evaluations, so i think about that every day: what a rubric can't see, and who gets to write it. this is why we g/acc: gender accelerationism, using technology to decide what our bodies and minds become instead of waiting for an evaluator's permission.",
        ],
        refs: [
          { text: "this is why we g/acc", href: GACC_TWEET },
          { text: "gender accelerationism", href: GACC_BLACKPAPER },
        ],
      },
      {
        q: "who shaped how you think?",
        a: [
          "sadie plant's zeros + ones, preciado, wittig, mark fisher, the ccru read queerly. serial experiments lain, more than once. on the safety side, the books that got me here: bostrom, tegmark, kurzweil.",
        ],
      },
      {
        q: "what do you do when you're not working?",
        a: [
          "i make music as messier: idm, ambient, jungle, noise. and i write prose poetry and theory-fiction on messinecessity.",
        ],
        refs: [
          { text: "music as messier", href: "https://mmessier.bandcamp.com" },
          { text: "messinecessity", href: "https://messinecessity.substack.com" },
        ],
      },
    ],
  },
  {
    title: "what's next",
    items: [
      {
        q: "what roles are you looking for?",
        a: [
          "a generalist role on a safety team, research engineering on evals, or ai safety communication. i need a high-integrity team and a desk. i'll bring the rest myself.",
        ],
      },
      {
        q: "where do you want to work?",
        a: [
          "wherever the work is serious. the bay keeps pulling me, but the next thing i build will most likely be in europe.",
        ],
      },
      {
        q: "where do you see yourself in five years?",
        a: [
          "i don't know where. i know what i want to see: my work touching real people, minds changing in good ways. i want humanity to reach its next step in intelligence, and ai might be how we get there, together with intelligence amplification and education.",
          "we shouldn't outsource our intelligence to another being. i'd rather we build technology that makes us collectively smarter, and see what kind of society that lets us become.",
        ],
      },
    ],
  },
]
