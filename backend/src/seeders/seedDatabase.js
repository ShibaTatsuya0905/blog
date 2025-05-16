const db = require('../models');
const slugify = require('slugify');

const categoriesData = [
    { name: "Game", description: "Bài viết liên quan đến trò chơi điện tử." },
    { name: "Anime", description: "Bài viết liên quan đến hoạt hình Nhật Bản." },
    { name: "Manga", description: "Bài viết liên quan đến truyện tranh Nhật Bản." }
];

const tagsData = [
    "Action (Game)",
    "Action RPG (Game)",
    "Adventure (Game)",
    "Board Game (Game)",
    "Card Game (Game)",
    "City Builder (Game)",
    "Dating Sim (Game)",
    "Educational (Game)",
    "Fighting (Game)",
    "FPS (First-Person Shooter) (Game)",
    "Grand Strategy (Game)",
    "Hack and Slash (Game)",
    "Horror (Game)",
    "Idle / Clicker (Game)",
    "JRPG (Japanese RPG) (Game)",
    "Life Simulation (Game)",
    "Management / Tycoon (Game)",
    "Metroidvania (Game)",
    "MMORPG (Massively Multiplayer Online RPG) (Game)",
    "MOBA (Multiplayer Online Battle Arena) (Game)",
    "Music / Rhythm (Game)",
    "Open World (Game)",
    "Otome Game (Game)",
    "Party Game (Game)",
    "Platformer (Game)",
    "Puzzle (Game)",
    "Racing (Game)",
    "Real-Time Strategy (RTS) (Game)",
    "Roguelike / Roguelite (Game)",
    "RPG (Role-Playing Game) (Game)",
    "Sandbox (Game)",
    "Shooter (Game)",
    "Simulation (Game)",
    "Souls-like (Game)",
    "Sports (Game)",
    "Stealth (Game)",
    "Strategy (Game)",
    "Survival (Game)",
    "Survival Horror (Game)",
    "Tactical RPG (Game)",
    "Text Adventure / Interactive Fiction (Game)",
    "Tower Defense (Game)",
    "TPS (Third-Person Shooter) (Game)",
    "Turn-Based Strategy (TBS) (Game)",
    "Turn-Based Tactics (Game)",
    "Vehicle Simulation (Game)",
    "Visual Novel (Game)",
    "Walking Simulator (Game)",
    "4X (Explore, Expand, Exploit, Exterminate) (Game)",
    "Alternate History (Game)",
    "Anime Style (Game)",
    "Cartoon / Comic (Game)",
    "Comedy (Game)",
    "Crime (Game)",
    "Cyberpunk (Game)",
    "Dark Fantasy (Game)",
    "Detective / Mystery (Game)",
    "Dystopian (Game)",
    "Espionage (Game)",
    "Fantasy (Game)",
    "Historical (Game)",
    "Lovecraftian / Cosmic Horror (Game)",
    "Martial Arts (Game)",
    "Medieval (Game)",
    "Military (Game)",
    "Modern (Game)",
    "Mythology (Game)",
    "Ninja / Samurai (Game)",
    "Noir (Game)",
    "Pirate (Game)",
    "Pixel Graphics (Game)",
    "Post-Apocalyptic (Game)",
    "Prehistoric (Game)",
    "Psychological Horror (Game)",
    "Romance (Game)",
    "Sci-Fi (Science Fiction) (Game)",
    "Space (Game)",
    "Steampunk (Game)",
    "Superhero (Game)",
    "Urban Fantasy (Game)",
    "Vampire (Game)",
    "War (Game)",
    "Western (Game)",
    "Zombies (Game)",
    "Atmospheric (Game)",
    "Base Building (Game)",
    "Character Customization (Game)",
    "Choices Matter / Multiple Endings (Game)",
    "Co-op (Game)",
    "Crafting (Game)",
    "Difficult (Game)",
    "Early Access (Game)",
    "Episodic (Game)",
    "Exploration (Game)",
    "Family Friendly (Game)",
    "Fast-Paced (Game)",
    "Female Protagonist (Game)",
    "First-Person (Game)",
    "Free to Play (F2P) (Game)",
    "Funny / Humorous (Game)",
    "Great Soundtrack (Game)",
    "Indie (Game)",
    "LGBTQ+ (Game)",
    "Local Co-op (Game)",
    "Local Multiplayer (Game)",
    "Loot (Game)",
    "Mature (Game)",
    "Moddable / Mod Support (Game)",
    "Multiplayer (Game)",
    "Online Co-op (Game)",
    "Online Multiplayer / PvP (Game)",
    "Physics (Game)",
    "Procedural Generation (Game)",
    "Replay Value (Game)",
    "Retro (Game)",
    "Rich Story / Narrative-Driven (Game)",
    "Singleplayer (Game)",
    "Split Screen (Game)",
    "Story Rich (Game)",
    "Third Person (Game)",
    "Top-Down (Game)",
    "VR (Virtual Reality) (Game)",
    "Action (Anime)",
    "Adventure (Anime)",
    "Avant Garde (Anime)",
    "Boys Love / Yaoi (Anime)",
    "Cars (Anime)",
    "Comedy (Anime)",
    "Dementia (Anime)",
    "Demons (Anime)",
    "Drama (Anime)",
    "Ecchi (Anime)",
    "Fantasy (Anime)",
    "Game (Anime)",
    "Girls Love / Yuri (Anime)",
    "Gore (Anime)",
    "Harem (Anime)",
    "Hentai (Anime)",
    "Historical (Anime)",
    "Horror (Anime)",
    "Idols (Female) (Anime)",
    "Idols (Male) (Anime)",
    "Isekai (Another World) (Anime)",
    "Iyashikei (Healing) (Anime)",
    "Josei (Anime)",
    "Kids (Anime)",
    "Magic (Anime)",
    "Magical Girl (Mahou Shoujo) (Anime)",
    "Martial Arts (Anime)",
    "Mecha (Anime)",
    "Military (Anime)",
    "Music (Anime)",
    "Mystery (Anime)",
    "Mythology (Anime)",
    "Parody (Anime)",
    "Police (Anime)",
    "Post-Apocalyptic (Anime)",
    "Psychological (Anime)",
    "Reverse Harem (Anime)",
    "Romance (Anime)",
    "Samurai (Anime)",
    "School (Anime)",
    "Sci-Fi (Science Fiction) (Anime)",
    "Seinen (Anime)",
    "Shonen (Anime)",
    "Shojo (Anime)",
    "Slice of Life (Anime)",
    "Space (Anime)",
    "Sports (Anime)",
    "Super Power (Anime)",
    "Supernatural (Anime)",
    "Survival (Anime)",
    "Suspense (Anime)",
    "Thriller (Anime)",
    "Time Travel (Anime)",
    "Vampire (Anime)",
    "Work Life (Anime)",
    "CGDCT (Cute Girls Doing Cute Things) (Anime)",
    "Abstract Narrative (Anime)",
    "CG Animation (Anime)",
    "Donghua (Chinese Animation) (Anime)",
    "Experimental (Anime)",
    "Flash Animation (Anime)",
    "Full Color (Anime)",
    "Light Novel Adaptation (Anime)",
    "Manga Adaptation (Anime)",
    "Movie (Anime)",
    "ONA (Original Net Animation) (Anime)",
    "Original Work (Anime)",
    "OVA (Original Video Animation) (Anime)",
    "Short Film (Anime)",
    "Special (Anime)",
    "Stop Motion (Anime)",
    "TV Series (Anime)",
    "Visual Novel Adaptation (Anime)",
    "Web Animation (Anime)",
    "Action (Manga)",
    "Adventure (Manga)",
    "Boys Love / Yaoi (Manga)",
    "Comedy (Manga)",
    "Cooking (Manga)",
    "Demons (Manga)",
    "Drama (Manga)",
    "Ecchi (Manga)",
    "Fantasy (Manga)",
    "Game (Manga)",
    "Gender Bender (Manga)",
    "Girls Love / Yuri (Manga)",
    "Gore (Manga)",
    "Harem (Manga)",
    "Hentai (Manga)",
    "Historical (Manga)",
    "Horror (Manga)",
    "Isekai (Another World) (Manga)",
    "Iyashikei (Healing) (Manga)",
    "Josei (Manga)",
    "Kids (Manga)",
    "Magic (Manga)",
    "Magical Girl (Mahou Shoujo) (Manga)",
    "Martial Arts (Manga)",
    "Mature (Manga)",
    "Mecha (Manga)",
    "Medical (Manga)",
    "Military (Manga)",
    "Music (Manga)",
    "Mystery (Manga)",
    "Mythology (Manga)",
    "Office Workers (Manga)",
    "Parody (Manga)",
    "Philosophical (Manga)",
    "Police (Manga)",
    "Post-Apocalyptic (Manga)",
    "Psychological (Manga)",
    "Reverse Harem (Manga)",
    "Romance (Manga)",
    "Samurai (Manga)",
    "School Life (Manga)",
    "Sci-Fi (Science Fiction) (Manga)",
    "Seinen (Manga)",
    "Shonen (Manga)",
    "Shonen Ai (Manga)",
    "Shojo (Manga)",
    "Shojo Ai (Manga)",
    "Slice of Life (Manga)",
    "Smut (Manga)",
    "Space (Manga)",
    "Sports (Manga)",
    "Super Power (Manga)",
    "Supernatural (Manga)",
    "Survival (Manga)",
    "Suspense (Manga)",
    "Thriller (Manga)",
    "Time Travel (Manga)",
    "Tragedy (Manga)",
    "Vampire (Manga)",
    "Webcomic (Manga)",
    "Work Life (Manga)",
    "Zombies (Manga)",
    "4-koma (Manga)",
    "Adaptation (Manga)",
    "Anthology (Manga)",
    "Doujinshi (Manga)",
    "Full Color (Manga)",
    "Light Novel Adaptation (Manga)",
    "Manfra (French Manga-style) (Manga)",
    "Manhua (Chinese Manga) (Manga)",
    "Manhwa (Korean Manga) (Manga)",
    "One-shot (Manga)",
    "Original Work (Manga)",
    "Webtoon (Manga)",
    "Award Winning (Manga)"
];

const seedDatabase = async () => {
    try {
        console.log("Synchronizing database schema before seeding...");
        await db.sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
        console.log("Database schema synchronized.");

        console.log("Seeding categories...");
        for (const catData of categoriesData) {
            const slug = slugify(catData.name, { lower: true, strict: true, remove: /[*+~.()'"!:@]/g });
            const [category, created] = await db.Category.findOrCreate({
                where: { slug: slug },
                defaults: {
                    name: catData.name,
                    slug: slug,
                    description: catData.description
                }
            });
            if (created) {
                console.log(`Created category: ${category.name}`);
            } else {
                if (category.description !== catData.description && catData.description !== undefined) {
                    category.description = catData.description;
                    await category.save();
                    console.log(`Updated description for category: ${category.name}`);
                } else {
                    console.log(`Category already exists: ${category.name}`);
                }
            }
        }
        console.log("Categories seeding finished.");

        console.log("Seeding tags...");
        for (const tagName of tagsData) {
            const slug = slugify(tagName, { lower: true, strict: true, remove: /[*+~.()'"!:@]/g });
            const [tag, created] = await db.Tag.findOrCreate({
                where: { slug: slug },
                defaults: {
                    name: tagName,
                    slug: slug
                }
            });
            if (created) {
                console.log(`Created tag: ${tag.name}`);
            } else {
                console.log(`Tag already exists: ${tag.name}`);
            }
        }
        console.log("Tags seeding finished.");

        console.log("Database seeding completed successfully!");
    } catch (error) {
        console.error("Error seeding database:", error);
        throw error;
    } finally {
        if (require.main === module) {
            await db.sequelize.close();
            console.log("Database connection closed after standalone seeding.");
        }
    }
};

if (require.main === module) {
    seedDatabase()
        .then(() => {
            console.log("Seeding script finished successfully (standalone).");
        })
        .catch(err => {
            console.error("Seeding script failed (standalone):", err.message);
            process.exit(1);
        });
}

module.exports = seedDatabase;