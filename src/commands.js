
import { InlineKeyboard } from "grammy"
import { randomInt } from "node:crypto"

const CHANNEL = "@Ususu27"
const ADMIN_ID = process.env.ADMIN_ID || ""

const users = new Set()

const names = [
  "Alex Morgan", "Daniel Smith", "Ryan Wilson",
  "Oliver Brown", "James Taylor", "Noah Martin",
  "Emma Johnson", "Sophia Williams", "Olivia Davis",
  "Mia Anderson", "Ava Thomas", "Isabella Moore"
]

const menu = new InlineKeyboard()
  .text("👤 Fake Name", "name")
  .text("🎂 Random DOB", "dob")
  .row()
  .text("🔐 Password", "password")
  .text("🎲 Generate All", "all")
  .row()
  .text("👑 Admin Panel", "admin")

const joinKeyboard = new InlineKeyboard()
  .url("📢 Join Channel", "https://t.me/Ususu27")
  .row()
  .text("✅ I Joined - Check", "check")

async function isMember(ctx) {
  try {
    const member = await ctx.api.getChatMember(
      CHANNEL,
      ctx.from.id
    )
    return ["creator", "administrator", "member"].includes(member.status) ||
      (member.status === "restricted" && member.is_member)
  } catch {
    return false
  }
}

async function requireJoin(ctx) {
  if (await isMember(ctx)) return true

  await ctx.reply(
    "🔒 বট ব্যবহার করতে আগে আমাদের চ্যানেলে Join করুন।",
    { reply_markup: joinKeyboard }
  )
  return false
}

function fakeName() {
  return names[randomInt(names.length)]
}

function fakeDOB() {
  const year = randomInt(1985, 2006)
  const month = randomInt(1, 13)
  const day = randomInt(1, 29)
  return `${String(day).padStart(2, "0")}-${String(month).padStart(2, "0")}-${year}`
}

function password() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%"
  return Array.from({ length: 16 }, () => chars[randomInt(chars.length)]).join("")
}

export function registerCommands(bot) {
  bot.command("start", async (ctx) => {
    users.add(ctx.from.id)
    await ctx.reply(
      `👋 Welcome ${ctx.from.first_name}!\n\n✨ FAKE DATA GENERATOR\n\nনিচের বাটন থেকে পছন্দের ডেটা তৈরি করুন।`,
      { reply_markup: menu }
    )
  })

  bot.command("help", (ctx) =>
    ctx.reply("ব্যবহার:\n/start - Bot চালু\n/id - আপনার ID\n/admin - Admin Panel")
  )

  bot.command("id", (ctx) =>
    ctx.reply(`আপনার Telegram ID: ${ctx.from.id}`)
  )

  bot.command("admin", async (ctx) => {
    if (!ADMIN_ID || String(ctx.from.id) !== ADMIN_ID) {
      return ctx.reply("⛔ আপনি Admin নন।")
    }
    await ctx.reply(
      `👑 ADMIN PANEL\n\n👥 মোট ব্যবহারকারী: ${users.size}\n\nবট চালু আছে।`,
    )
  })

  bot.callbackQuery("check", async (ctx) => {
    await ctx.answerCallbackQuery()
    if (await isMember(ctx)) {
      await ctx.reply("✅ Join সফল হয়েছে! এখন /start দিন।", {
        reply_markup: menu
      })
    } else {
      await ctx.reply("❌ আপনি এখনো চ্যানেলে Join করেননি।")
    }
  })

  const actions = {
    name: () => `👤 Fake Name: ${fakeName()}`,
    dob: () => `🎂 Random DOB: ${fakeDOB()}`,
    password: () => `🔐 Strong Password:\n${password()}`,
    all: () =>
      `🎲 FAKE DATA\n\n👤 Name: ${fakeName()}\n🎂 DOB: ${fakeDOB()}\n🔐 Password: ${password()}`
  }

  for (const [key, generate] of Object.entries(actions)) {
    bot.callbackQuery(key, async (ctx) => {
      await ctx.answerCallbackQuery()
      if (!(await requireJoin(ctx))) return
      await ctx.reply(generate(), { reply_markup: menu })
    })
  }

  bot.callbackQuery("admin", async (ctx) => {
    await ctx.answerCallbackQuery()
    if (!ADMIN_ID || String(ctx.from.id) !== ADMIN_ID) {
      return ctx.reply("⛔ Admin access denied.")
    }
    await ctx.reply(
      `👑 ADMIN PANEL\n\n👥 মোট ব্যবহারকারী: ${users.size}\n\n/status - Bot status`
    )
  })

  bot.command("status", async (ctx) => {
    if (!ADMIN_ID || String(ctx.from.id) !== ADMIN_ID) {
      return ctx.reply("⛔ Admin access denied.")
    }
    await ctx.reply(`✅ Bot is running\n👥 Users: ${users.size}`)
  })
}
