import type { BotCtx, BotNode, BotOption } from "./botTypes";

const isBiz = (c: BotCtx) => c.role === "business" || c.role === "admin";
const isPro = (c: BotCtx) => c.tier === "pro" || c.tier === "expert";
const money = { free: "R49 a month after your first 90 days", pro: "R199 a month", expert: "R449 a month" };

const daysLeft = (iso?: string | null) => {
  if (!iso) return null;
  const d = Math.ceil((new Date(iso).getTime() - Date.now()) / 864e5);
  return d;
};

const backHome: BotOption = { label: "Something else", to: "root" };
const human = (topic: string): BotOption => ({ label: "Message Jack on WhatsApp", wa: topic });

export const TREE: Record<string, BotNode> = {

  /* ------------------------------------------------------------ ROOT */
  root: {
    say: (c) => {
      if (c.role === "admin") return ["Hi Jack. What do you need?"];
      if (c.role === "business")
        return [`Hi${c.name ? " " + c.name.split(" ")[0] : ""}. I can help with ${c.businessName || "your listing"}.`,
                "What would you like to do?"];
      if (c.role === "resident")
        return [`Hi${c.name ? " " + c.name.split(" ")[0] : ""}. What can I help with?`];
      return ["Hi, I'm the Hub helper.", "What brings you here?"];
    },
    options: (c) => {
      if (c.role === "admin")
        return [
          { label: "Pages waiting for approval", href: "/admin/approvals" },
          { label: "All businesses", href: "/admin/businesses" },
          { label: "How the Hub works", to: "about" },
          { label: "Plans and prices", to: "pricing" },
        ];
      if (c.role === "business")
        return [
          { label: "How is my listing doing?", to: "biz_status" },
          { label: "Get more customers", to: "biz_grow" },
          { label: "My page, photos and prices", to: "biz_page" },
          { label: "Offers and events", to: "biz_offers" },
          { label: "Reviews and my badge", to: "biz_reviews" },
          { label: "Billing and my plan", to: "biz_billing" },
          { label: "Something is broken", to: "trouble" },
        ];
      return [
        { label: "Find a local business", to: "find" },
        { label: "Offers and events", to: "res_offers" },
        { label: "Reviews and saving", to: "res_reviews" },
        { label: "I run a business", to: "biz_intro" },
        { label: "What is The Harfield Hub?", to: "about" },
        { label: "My account", to: "account" },
      ];
    },
  },

  /* ------------------------------------------------------------ ABOUT */
  about: {
    say: () => [
      "The Harfield Hub is a directory of businesses in Harfield Village.",
      "Residents search for what they need, see prices, offers and reviews, then message the business straight on WhatsApp.",
      "It is run by Jack Moss, who lives on Durham Street. Free for residents to use, always.",
    ],
    options: (c) => [
      { label: "Why should I use it instead of Google?", to: "about_why" },
      { label: "When is the launch event?", to: "launch" },
      isBiz(c) ? { label: "Back to my listing", to: "root" } : { label: "I run a business", to: "biz_intro" },
      backHome,
    ],
  },

  about_why: {
    say: () => [
      "Three reasons.",
      "1. Everyone on here is in or around the village, so they are minutes away, not across town.",
      "2. You see prices, photos and reviews from neighbours before you call.",
      "3. One tap opens WhatsApp. No forms, no waiting for a callback.",
    ],
    options: () => [{ label: "Show me the directory", href: "/" }, backHome],
  },

  launch: {
    say: () => [
      "Our launch event is in October, here in Harfield Village.",
      "Residents come and meet the local businesses face to face. Details will be posted on the events page closer to the time.",
    ],
    options: () => [
      { label: "See what's on", href: "/events" },
      human("the launch event"),
      backHome,
    ],
  },

  /* ------------------------------------------------------------ RESIDENT: FIND */
  find: {
    say: () => [
      "Easiest way is the search box on the front page. Type what you need, like plumber, coffee, physio or dog walking.",
      "You can also tap a category, sort by top rated, or show only businesses rated four stars and up.",
    ],
    options: () => [
      { label: "Open the directory", href: "/" },
      { label: "What do the badges mean?", to: "badges" },
      { label: "I can't find what I need", to: "find_missing" },
      backHome,
    ],
  },

  find_missing: {
    say: () => [
      "A few things to try first.",
      "Use a shorter word. Searching plumb finds more than emergency plumber.",
      "Clear the category filter, because it narrows things a lot.",
      "If the business genuinely is not on here yet, tell Jack and he will invite them.",
    ],
    options: () => [
      { label: "Try the directory again", href: "/" },
      human("a business that is missing from the Hub"),
      backHome,
    ],
  },

  badges: {
    say: () => [
      "Verified means Jack has checked the business is real and actually trades in the village. It is not something you can buy.",
      "Featured is an Expert listing. They sit at the top of their category, and only three businesses per category can hold it.",
      "Stars are the average of reviews from residents who have used them.",
    ],
    options: () => [{ label: "How do reviews work?", to: "res_reviews" }, backHome],
  },

  /* ------------------------------------------------------------ RESIDENT: OFFERS + EVENTS */
  res_offers: {
    say: () => [
      "Offers are deals posted by listed businesses. You will see them on the offers page, and a business with a live offer shows an Offer on tag in the directory.",
      "There is no voucher to buy and no code to enter. Message the business and mention the offer.",
      "Events are markets, classes, tastings and open days. They are listed by date and drop off once the date has passed.",
    ],
    options: () => [
      { label: "See the offers", href: "/offers" },
      { label: "See what's on", href: "/events" },
      backHome,
    ],
  },

  /* ------------------------------------------------------------ RESIDENT: REVIEWS + SAVING */
  res_reviews: {
    say: (c) => {
      const base = [
        "You can review any listed business you have used. Your name shows on the review, which keeps things fair.",
        "One review per business. You can change it or delete it whenever you like.",
      ];
      if (c.role === "guest") base.push("You need an account to leave a review or save a business. It takes about a minute.");
      return base;
    },
    options: (c) => {
      const o: BotOption[] = [];
      if (c.role === "guest") {
        o.push({ label: "Create a resident account", href: "/signup/resident" });
        o.push({ label: "Log in", href: "/login" });
      }
      o.push({ label: "Can I review my own business?", to: "res_reviews_own" });
      o.push({ label: "A review looks unfair", to: "res_reviews_flag" });
      o.push(backHome);
      return o;
    },
  },

  res_reviews_own: {
    say: () => [
      "No. The Hub blocks a business owner from reviewing their own business, and it blocks it properly, not just by hiding the button.",
      "That is what keeps the stars worth something.",
    ],
    options: () => [backHome],
  },

  res_reviews_flag: {
    say: () => [
      "Reviews are not deleted just because a business does not like them.",
      "But if one is abusive, untrue, or clearly not from a real customer, send it to Jack and he will look at it and can hide it.",
    ],
    options: () => [human("a review that needs looking at"), backHome],
  },

  /* ------------------------------------------------------------ ACCOUNT */
  account: {
    say: (c) =>
      c.role === "guest"
        ? ["You do not need an account to search or to message a business.",
           "You need one to save businesses and to leave reviews."]
        : ["You are logged in. You can save businesses and leave reviews.",
           "Your session stays on this device, so you should not need to log in again."],
    options: (c) => {
      const o: BotOption[] = [];
      if (c.role === "guest") {
        o.push({ label: "Create a resident account", href: "/signup/resident" });
        o.push({ label: "List a business instead", href: "/join/apply" });
        o.push({ label: "Log in", href: "/login" });
      } else {
        o.push({ label: "I forgot my password", to: "account_password" });
        o.push({ label: "Change my email or name", to: "account_change" });
      }
      o.push(backHome);
      return o;
    },
  },

  account_password: {
    say: () => [
      "Message Jack and he will send you a reset link. There is no self-service reset yet.",
      "It usually takes him a few minutes during the day.",
    ],
    options: () => [human("a password reset"), backHome],
  },

  account_change: {
    say: () => [
      "Your email is your login, so Jack changes it for you to keep the account safe.",
      "Send him the old email and the new one.",
    ],
    options: () => [human("changing my account email"), backHome],
  },

  /* ------------------------------------------------------------ BUSINESS INTRO (not logged in) */
  biz_intro: {
    say: () => [
      "Good. Listing takes about five minutes and your first 90 days are free on the Free plan. No card needed.",
      "You get a listing with WhatsApp and call buttons, you appear in every search, and you can see how many people viewed and messaged you.",
      "Pro adds a verified badge, reviews, your own page with photos and prices, unlimited offers, and a QR code for your window.",
    ],
    options: () => [
      { label: "Start my listing", href: "/join/apply" },
      { label: "Show me the plans", to: "pricing" },
      { label: "What do I need to have ready?", to: "biz_ready" },
      { label: "Can Jack set it up for me?", to: "biz_doneforme" },
      backHome,
    ],
  },

  biz_ready: {
    say: () => [
      "Very little. Your business name, your category, your WhatsApp number, and one line about what you do.",
      "Photos, prices and hours are optional and you can add them later.",
      "If you have a menu or price list, you can paste it in and the Hub turns it into a proper list for you.",
    ],
    options: () => [{ label: "Start my listing", href: "/join/apply" }, backHome],
  },

  biz_doneforme: {
    say: () => [
      "Yes. Send Jack your business name, what you do in one line, your WhatsApp number and a photo if you have one.",
      "He will build the listing and send you the link when it is live.",
    ],
    options: () => [human("setting up my listing for me"), backHome],
  },

  /* ------------------------------------------------------------ BUSINESS: STATUS */
  biz_status: {
    say: (c) => {
      const out: string[] = [];
      if (c.status === "pending")
        out.push("Your listing is waiting for approval. It is not on the directory yet. Jack usually gets to these within a day.");
      else if (c.status === "live") out.push("Your listing is live on the directory.");
      else if (c.status === "hidden") out.push("Your listing is hidden at the moment, so residents cannot see it.");
      else if (c.status === "suspended") out.push("Your listing is suspended. Jack will have sent you a note about why.");

      if (c.status === "live") {
        const v = c.views ?? 0, m = c.msgs ?? 0;
        out.push(`In the last 30 days you appeared ${v} ${v === 1 ? "time" : "times"} and ${m} ${m === 1 ? "person" : "people"} messaged you.`);
        if (v > 0 && m === 0)
          out.push("People are seeing you but not messaging. That usually means there is nothing on your listing to decide on. Photos and a starting price fix it faster than anything else.");
        if (v === 0)
          out.push("No views yet. That is normal in the first week. Sharing your link and putting up your QR code is the quickest way to change it.");
      }
      if (c.tier === "free") {
        const d = daysLeft(c.trialEndsAt);
        if (d !== null && d > 0) out.push(`You have ${d} days left of your free 90 days.`);
        else if (d !== null) out.push("Your free 90 days have ended, so your listing is now R49 a month.");
      }
      return out;
    },
    options: (c) => {
      const o: BotOption[] = [{ label: "See my full numbers", href: "/dashboard" }];
      if (c.status === "live" && c.slug) o.push({ label: "View my listing", href: `/b/${c.slug}` });
      o.push({ label: "What do the numbers mean?", to: "biz_numbers" });
      o.push({ label: "Get more customers", to: "biz_grow" });
      if (c.status !== "live") o.push(human("my listing status"));
      o.push(backHome);
      return o;
    },
  },

  biz_numbers: {
    say: () => [
      "Times you appeared means your card showed up in a search or a category, or someone opened your page.",
      "WhatsApp messages counts taps on your WhatsApp button. It counts the tap, so a few of them may not have sent a message.",
      "Calls counts taps on your call button. Saved you means a resident kept you in their saved list.",
      "All of it is the last 30 days.",
    ],
    options: () => [{ label: "See my numbers", href: "/dashboard" }, backHome],
  },

  /* ------------------------------------------------------------ BUSINESS: GROW */
  biz_grow: {
    say: (c) => {
      const out = ["Here is what actually moves the needle, in order."];
      if (!isPro(c)) {
        out.push("1. Add photos and a starting price. Listings with both get chosen far more often than a name on its own. That needs Pro.");
        out.push("2. Post an offer when you want a busier week.");
        out.push("3. Ask two happy customers to leave a review.");
        out.push("4. Put your QR code in your window.");
        out.push("Items 1 to 4 are all Pro features, which is R199 a month.");
      } else {
        out.push("1. Photos. Six good ones beat any amount of text.");
        out.push("2. A starting price. People skip listings that make them ask.");
        out.push("3. An offer. It puts you on the offers page and adds a tag to your card.");
        out.push("4. Reviews. Ask two happy customers by WhatsApp today. It takes them a minute.");
        out.push("5. Your QR code in the window and on your invoices.");
      }
      return out;
    },
    options: (c) => {
      const o: BotOption[] = [];
      if (isPro(c)) {
        o.push({ label: "Edit my page", href: "/dashboard/page" });
        o.push({ label: "Post an offer", href: "/dashboard/offers" });
        o.push({ label: "How do I ask for reviews?", to: "biz_ask_reviews" });
        o.push({ label: "Where do I put my QR code?", to: "biz_qr" });
      } else {
        o.push({ label: "What exactly is in Pro?", to: "pricing_pro" });
        o.push({ label: "Upgrade to Pro", to: "biz_upgrade" });
      }
      o.push(backHome);
      return o;
    },
  },

  biz_ask_reviews: {
    say: (c) => [
      "Send this to two or three customers you know were happy. It works because it is short and it is easy.",
      `"Hi, quick favour. We are listed on The Harfield Hub now. If you have a minute, a short review would really help us: ${c.slug ? "/b/" + c.slug : "our page"}"`,
      "Do not offer anything in exchange for a review. Residents notice, and it damages the thing that makes reviews worth having.",
    ],
    options: (c) => {
      const o: BotOption[] = [];
      if (c.slug) o.push({ label: "Open my page", href: `/b/${c.slug}` });
      o.push({ label: "Someone left an unfair review", to: "biz_bad_review" });
      o.push(backHome);
      return o;
    },
  },

  biz_qr: {
    say: () => [
      "Your QR code is on your dashboard. Download it as a PNG and print it.",
      "Best places, in order: your window or front counter, your invoices and quotes, your vehicle, and the back of your business card.",
      "Someone scans it and lands straight on your page, where your photos, prices and reviews are.",
    ],
    options: () => [{ label: "Get my QR code", href: "/dashboard" }, backHome],
  },

  /* ------------------------------------------------------------ BUSINESS: PAGE */
  biz_page: {
    say: (c) => {
      if (!isPro(c))
        return ["Your own page is a Pro feature. It gives you photos, an about section, your full price list and your colours.",
                "Pro is R199 a month, about R6.50 a day."];
      const out: string[] = [];
      if (c.pageStatus === "live") out.push("Your page is live. Any change you make goes back to Jack for a quick check before it shows.");
      else if (c.pageStatus === "pending") out.push("Your page is with Jack for review. You can still make changes while you wait.");
      else if (c.adminNote) out.push(`Jack sent your page back with a note: "${c.adminNote}"`);
      else out.push("You have not sent your page for review yet. Fill it in and press Send for review.");
      out.push("The page builder takes your about text, your colours, your logo, up to six photos, and your price list.");
      return out;
    },
    options: (c) => {
      if (!isPro(c))
        return [{ label: "What exactly is in Pro?", to: "pricing_pro" }, { label: "Upgrade to Pro", to: "biz_upgrade" }, backHome];
      return [
        { label: "Open the page builder", href: "/dashboard/page" },
        { label: "How do I add my price list?", to: "biz_pricelist" },
        { label: "What photos should I use?", to: "biz_photos" },
        { label: "Why does it need approval?", to: "biz_approval" },
        backHome,
      ];
    },
  },

  biz_pricelist: {
    say: () => [
      "Paste it into the box, one item per line, then press Turn this into a list.",
      "It reads most shapes. Haircut - R180, Haircut R180, or Haircut | wash and cut | R180 all work.",
      "A short line with no price becomes a heading, so you can group things like Starters or Ladies.",
      "Everything is editable afterwards, so nothing is stuck if it reads a line wrong.",
    ],
    options: () => [{ label: "Open the page builder", href: "/dashboard/page" }, backHome],
  },

  biz_photos: {
    say: () => [
      "Real photos of your work, your shop and your team. Not stock images. Residents can tell.",
      "Landscape works best. Six is the maximum, but four good ones beat six average ones.",
      "The first photo is the one that shows on your card in the directory, so make it your strongest.",
      "If you would rather have them done properly, Jack does shoots from R500.",
    ],
    options: () => [
      { label: "Open the page builder", href: "/dashboard/page" },
      human("a photo shoot for my listing"),
      backHome,
    ],
  },

  biz_approval: {
    say: () => [
      "Pages are checked once before they go live. It is a quick look for broken text, wrong prices and photos that are not yours.",
      "It protects everyone on the Hub, because one bad page makes residents trust the whole directory less.",
      "Offers, events and your price list do not need approval. Those go live straight away.",
    ],
    options: () => [backHome],
  },

  /* ------------------------------------------------------------ BUSINESS: OFFERS + EVENTS */
  biz_offers: {
    say: (c) => {
      if (!isPro(c))
        return ["Offers and events are Pro features.",
                "An offer puts you on the offers page and adds an Offer on tag to your card in the directory. You can post as many as you like at no extra cost."];
      const out = ["Offers and events go live immediately. No approval, no waiting."];
      if ((c.offers ?? 0) === 0)
        out.push("You have no offer running. That is the quickest free thing you can do to get noticed this week.");
      else out.push(`You have ${c.offers} running.`);
      out.push("Good offers are specific. R150 off your first service beats Great rates.");
      return out;
    },
    options: (c) => {
      if (!isPro(c)) return [{ label: "What exactly is in Pro?", to: "pricing_pro" }, { label: "Upgrade to Pro", to: "biz_upgrade" }, backHome];
      return [
        { label: "Post an offer", href: "/dashboard/offers" },
        { label: "Add an event", href: "/dashboard/events" },
        { label: "What makes a good offer?", to: "biz_offer_tips" },
        backHome,
      ];
    },
  },

  biz_offer_tips: {
    say: () => [
      "Be specific about the number and the thing. R150 off your first service. Free croissant with any coffee before 9am.",
      "Give it an end date. Open-ended offers get ignored.",
      "Make it something you can honour on a busy day, because a broken promise in a village travels fast.",
      "Change it every few weeks so regulars have a reason to look again.",
    ],
    options: () => [{ label: "Post an offer", href: "/dashboard/offers" }, backHome],
  },

  /* ------------------------------------------------------------ BUSINESS: REVIEWS + BADGE */
  biz_reviews: {
    say: (c) => {
      const out: string[] = [];
      if (!isPro(c)) {
        out.push("Reviews and the verified badge are both Pro features.");
        out.push("Reviews are the thing residents look at hardest before they choose. The badge tells them Jack has checked you are real.");
        return out;
      }
      if (c.rating) out.push(`You are on ${c.rating} stars from ${c.reviews} ${c.reviews === 1 ? "review" : "reviews"}.`);
      else out.push("You have no reviews yet. Two is enough to change how your listing reads.");
      out.push(c.verified
        ? "You are verified, so residents see the badge on your card and your page."
        : "You are not verified yet. Jack grants it once he has checked your business is real and trading here. It is not something you pay for.");
      return out;
    },
    options: (c) => {
      const o: BotOption[] = [];
      if (!isPro(c)) { o.push({ label: "What exactly is in Pro?", to: "pricing_pro" }); o.push({ label: "Upgrade to Pro", to: "biz_upgrade" }); }
      else {
        o.push({ label: "How do I ask for reviews?", to: "biz_ask_reviews" });
        o.push({ label: "Someone left an unfair review", to: "biz_bad_review" });
        if (!c.verified) o.push(human("getting my business verified"));
      }
      o.push(backHome);
      return o;
    },
  },

  biz_bad_review: {
    say: () => [
      "First, reply to the customer directly if you can. Most bad reviews come from something fixable.",
      "Reviews are not removed just because they are negative. That is what makes the good ones believable.",
      "If it is abusive, untrue, or not from a real customer, send it to Jack. He can hide it.",
      "One poor review among several good ones does very little harm. A page with no reviews at all does more.",
    ],
    options: () => [human("a review on my listing"), backHome],
  },

  /* ------------------------------------------------------------ BUSINESS: BILLING */
  biz_billing: {
    say: (c) => {
      const out: string[] = [];
      if (c.tier === "free") {
        const d = daysLeft(c.trialEndsAt);
        out.push("You are on the Free plan.");
        if (d !== null && d > 0) out.push(`Your first 90 days are free. ${d} days left, then it is R49 a month.`);
        else out.push("Your free period has ended, so the Free listing is R49 a month.");
      } else if (c.tier === "pro") {
        out.push("You are on Pro, R199 a month, billed monthly.");
      } else if (c.tier === "expert") {
        out.push("You are on Expert, R449 a month, billed monthly.");
      }
      out.push("There is no contract. You can stop any time and drop back to the Free listing. Nothing is deleted, it is just hidden until you come back.");
      out.push("Card payments are being switched on. Until then Jack arranges it with you directly.");
      return out;
    },
    options: (c) => {
      const o: BotOption[] = [{ label: "Show me all the plans", to: "pricing" }];
      if (c.tier === "free") o.push({ label: "Upgrade to Pro", to: "biz_upgrade" });
      if (c.tier === "pro") o.push({ label: "What is in Expert?", to: "pricing_expert" });
      o.push({ label: "Change or cancel my plan", to: "biz_cancel" });
      o.push(human("billing"));
      o.push(backHome);
      return o;
    },
  },

  biz_cancel: {
    say: () => [
      "Message Jack and he will change or stop it. No notice period, no cancellation fee.",
      "If you cancel, your page and offers are hidden rather than deleted, and your free listing stays. If you come back, everything returns as it was.",
    ],
    options: () => [human("changing my plan"), backHome],
  },

  biz_upgrade: {
    say: (c) => [
      "Pro is R199 a month, about R6.50 a day. One job usually covers several months.",
      "You get a verified badge, reviews from neighbours, your own page with photos and prices, unlimited offers and events, a QR code, and a place above every free listing.",
      "Message Jack and he will switch you over, usually the same day.",
    ],
    options: (c) => [
      human(`upgrading ${c.businessName || "my business"} to Pro`),
      { label: "What exactly is in Pro?", to: "pricing_pro" },
      backHome,
    ],
  },

  /* ------------------------------------------------------------ PRICING */
  pricing: {
    say: () => [
      `Free — ${money.free}. Your listing, WhatsApp and call buttons, you appear in every search, and you see your own view and message counts.`,
      `Pro — ${money.pro}. Everything in Free, plus a verified badge, reviews, your own page with photos, your price list, unlimited offers and events, a QR code, and ranking above free listings.`,
      `Expert — ${money.expert}. Everything in Pro, plus top of your category with only three places, payment links, a coaching session every month and fresh photos each quarter.`,
    ],
    options: (c) => [
      { label: "Tell me more about Pro", to: "pricing_pro" },
      { label: "Tell me more about Expert", to: "pricing_expert" },
      isBiz(c) ? { label: "Upgrade", to: "biz_upgrade" } : { label: "Start my listing", href: "/join/apply" },
      backHome,
    ],
  },

  pricing_pro: {
    say: () => [
      "Pro, R199 a month.",
      "A verified badge that Jack grants after checking you are real.",
      "Reviews from residents, with their names on them.",
      "Your own page: photos, an about section, your colours and your full price list.",
      "Unlimited offers and events, live the moment you post them.",
      "A QR code for your window that opens your page.",
      "You rank above every free listing in your category.",
      "The first 15 Pro members keep R199 for a full year, even when the price rises.",
    ],
    options: (c) => [
      isBiz(c) ? { label: "Upgrade to Pro", to: "biz_upgrade" } : { label: "Start my listing", href: "/join/apply" },
      { label: "Compare all three plans", to: "pricing" },
      backHome,
    ],
  },

  pricing_expert: {
    say: () => [
      "Expert, R449 a month.",
      "Everything in Pro, plus the top spot in your category. Only three businesses per category can hold it.",
      "Payment links in your listing, a business coaching session with Jack every month, and fresh photos every quarter.",
      "It suits a business that wants to own its category rather than share it.",
    ],
    options: () => [human("the Expert plan"), { label: "Compare all three plans", to: "pricing" }, backHome],
  },

  /* ------------------------------------------------------------ TROUBLE */
  trouble: {
    say: () => ["Sorry about that. What is going wrong?"],
    options: () => [
      { label: "I can't log in", to: "account_password" },
      { label: "My photos will not upload", to: "trouble_upload" },
      { label: "My listing is not showing", to: "trouble_missing" },
      { label: "Something else", to: "trouble_other" },
      backHome,
    ],
  },

  trouble_upload: {
    say: () => [
      "Two things fix nearly all of these.",
      "Check the file is under 10MB. Photos straight off a newer phone are sometimes larger.",
      "Use a JPG, PNG or WEBP. HEIC from an iPhone often fails. In your iPhone camera settings, set Formats to Most Compatible and take it again.",
    ],
    options: () => [human("a problem uploading photos"), backHome],
  },

  trouble_missing: {
    say: (c) => {
      const out = ["A listing only shows on the directory once it is approved and set to live."];
      if (c.status === "pending") out.push("Yours is still waiting for approval, so that is why.");
      if (c.status === "hidden") out.push("Yours is hidden at the moment. Jack can put it back.");
      out.push("If it was live and has disappeared, message Jack and he will look right away.");
      return out;
    },
    options: () => [human("my listing not showing"), backHome],
  },

  trouble_other: {
    say: () => [
      "Send Jack a short description and a screenshot if you have one. That is usually enough for him to fix it quickly.",
    ],
    options: () => [human("a problem on the Hub"), backHome],
  },
};
