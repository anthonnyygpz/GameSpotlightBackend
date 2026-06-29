-- =============================================================
--  GAME SPOTLIGHT — Seed Data v2.0
--  Alineado con el schema de db.txt (MySQL 8.0+)
--  Ejecutar DESPUÉS de crear las tablas con db.txt
-- =============================================================

-- Limpiar datos previos (en orden para respetar FK)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE activity_logs;
TRUNCATE TABLE notifications;
TRUNCATE TABLE downloads;
TRUNCATE TABLE favorites;
TRUNCATE TABLE upcoming_releases;
TRUNCATE TABLE news_images;
TRUNCATE TABLE news;
TRUNCATE TABLE trailer_categories;
TRUNCATE TABLE trailers;
TRUNCATE TABLE game_platforms;
TRUNCATE TABLE game_genres;
TRUNCATE TABLE games;
TRUNCATE TABLE user_settings;
TRUNCATE TABLE user_roles;
TRUNCATE TABLE sessions;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================
--  JUEGOS
-- =============================================================

INSERT INTO games (game_id, title, slug, description, release_date, developer, publisher, cover_image, banner_url, status, featured) VALUES

-- Hero (featured)
(UUID(), 'Halo Infinite',
 'halo-infinite',
 'Acompaña al Jefe Maestro en la historia más épica de la saga. El anillo aguarda.',
 '2021-12-08', '343 Industries', 'Xbox Game Studios',
 'https://upload.wikimedia.org/wikipedia/en/1/14/Halo_Infinite.png',
 'https://store-images.s-microsoft.com/image/apps.62699.13727851868390641.c9cc5f66-aff8-4d9e-a5b0-d2aef58f5e28.4ef36cbc-d5c6-4fc0-98dc-c4e4af7e98d3',
 'active', TRUE),

(UUID(), 'Shadow of the Tomb Raider',
 'shadow-of-the-tomb-raider',
 'Vive el momento definitivo en que Lara Croft se convierte en la legendaria Tomb Raider.',
 '2018-09-14', 'Eidos Montréal', 'Square Enix',
 'https://upload.wikimedia.org/wikipedia/en/9/91/Shadow_of_the_Tomb_Raider_cover.png',
 'https://cdn.cloudflare.steamstatic.com/steam/apps/750920/header.jpg',
 'active', TRUE),

(UUID(), 'The Witcher 3: Wild Hunt',
 'witcher-3-wild-hunt',
 'Eres Geralt de Rivia, un cazador de monstruos a sueldo en un mundo abierto de fantasía épica.',
 '2015-05-19', 'CD Projekt Red', 'CD Projekt',
 'https://upload.wikimedia.org/wikipedia/en/0/0c/Witcher_3_cover_art.jpg',
 'https://cdn.cloudflare.steamstatic.com/steam/apps/292030/header.jpg',
 'active', TRUE),

-- Top Rated
(UUID(), 'Minecraft',
 'minecraft',
 'Explora mundos generados proceduralmente, construye estructuras increíbles y sobrevive en un universo sin límites.',
 '2011-11-18', 'Mojang Studios', 'Microsoft',
 'https://upload.wikimedia.org/wikipedia/en/5/51/Minecraft_cover.png',
 'https://www.minecraft.net/content/dam/games/minecraft/key-art/Homepage-Hero-FriendsJavaDungeonsEarth_1280x768.jpg',
 'active', FALSE),

(UUID(), 'Horizon Zero Dawn',
 'horizon-zero-dawn',
 'En un mundo post-apocalíptico dominado por máquinas, Aloy busca descubrir su verdadero origen.',
 '2017-02-28', 'Guerrilla Games', 'Sony Interactive Entertainment',
 'https://upload.wikimedia.org/wikipedia/en/8/81/Horizon_Zero_Dawn.jpg',
 'https://cdn.cloudflare.steamstatic.com/steam/apps/1151640/header.jpg',
 'active', FALSE),

(UUID(), 'God of War',
 'god-of-war-2018',
 'Kratos y su hijo Atreus emprenden un viaje épico por los reinos de la mitología nórdica.',
 '2018-04-20', 'Santa Monica Studio', 'Sony Interactive Entertainment',
 'https://upload.wikimedia.org/wikipedia/en/a/a7/God_of_War_4_cover.jpg',
 'https://cdn.cloudflare.steamstatic.com/steam/apps/1593500/header.jpg',
 'active', FALSE),

-- New Releases
(UUID(), 'Elden Ring',
 'elden-ring',
 'Un mundo abierto de fantasía oscura. Conviértete en el Señor del Anillo Áureo.',
 '2022-02-25', 'FromSoftware', 'Bandai Namco',
 'https://upload.wikimedia.org/wikipedia/en/b/b9/Elden_Ring_Box_art.jpg',
 'https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/header.jpg',
 'active', FALSE),

(UUID(), 'Cyberpunk 2077',
 'cyberpunk-2077',
 'Un RPG de acción en primera persona en Night City, la megalópolis más peligrosa del futuro.',
 '2020-12-10', 'CD Projekt Red', 'CD Projekt',
 'https://upload.wikimedia.org/wikipedia/en/9/9f/Cyberpunk_2077_box_art.jpg',
 'https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/header.jpg',
 'active', FALSE),

(UUID(), 'Starfield',
 'starfield',
 'Explora el cosmos en el juego de rol de ciencia ficción más ambicioso de Bethesda.',
 '2023-09-06', 'Bethesda Game Studios', 'Bethesda Softworks',
 'https://upload.wikimedia.org/wikipedia/en/b/b3/Starfield_game_cover.jpg',
 'https://cdn.cloudflare.steamstatic.com/steam/apps/1716740/header.jpg',
 'active', FALSE),

-- Upcoming
(UUID(), 'GTA VI',
 'gta-vi',
 'La siguiente entrega de la saga Grand Theft Auto regresa a los trópicos de Vice City.',
 NULL, 'Rockstar Games', 'Rockstar Games',
 'https://upload.wikimedia.org/wikipedia/en/2/27/GTA_VI_Logo.png',
 'https://assets.rockstargames.com/Octane/frontend/pages/gta-6/img/gta6-meta-image-en.jpg',
 'upcoming', FALSE),

(UUID(), 'Marvel\'s Wolverine',
 'marvels-wolverine',
 'Insomniac Games presenta la historia definitiva del mutante más salvaje de Marvel.',
 NULL, 'Insomniac Games', 'Sony Interactive Entertainment',
 'https://upload.wikimedia.org/wikipedia/en/0/00/Marvel%27s_Wolverine_cover_art.jpg',
 'https://gmedia.playstation.com/is/image/SIEPDC/wolverine-launch-image-block-01-en-14sep22',
 'upcoming', TRUE);


-- =============================================================
--  GÉNEROS → JUEGOS
-- =============================================================

-- Asociar juegos con géneros (usamos subqueries para evitar hardcodear UUIDs)
INSERT INTO game_genres (id, game_id, genre_id)
SELECT UUID(), g.game_id, ge.genre_id FROM games g, genres ge
WHERE (g.slug = 'halo-infinite'              AND ge.name IN ('Action', 'Shooter'))
   OR (g.slug = 'shadow-of-the-tomb-raider'  AND ge.name IN ('Action', 'Adventure'))
   OR (g.slug = 'witcher-3-wild-hunt'         AND ge.name IN ('RPG', 'Adventure'))
   OR (g.slug = 'minecraft'                   AND ge.name IN ('Sandbox', 'Survival', 'Adventure'))
   OR (g.slug = 'horizon-zero-dawn'           AND ge.name IN ('Action', 'RPG', 'Adventure'))
   OR (g.slug = 'god-of-war-2018'             AND ge.name IN ('Action', 'Adventure'))
   OR (g.slug = 'elden-ring'                  AND ge.name IN ('RPG', 'Action'))
   OR (g.slug = 'cyberpunk-2077'              AND ge.name IN ('RPG', 'Action', 'Shooter'))
   OR (g.slug = 'starfield'                   AND ge.name IN ('RPG', 'Adventure'))
   OR (g.slug = 'gta-vi'                      AND ge.name IN ('Action', 'Adventure'))
   OR (g.slug = 'marvels-wolverine'           AND ge.name IN ('Action', 'Adventure'));


-- =============================================================
--  PLATAFORMAS → JUEGOS
-- =============================================================

INSERT INTO game_platforms (id, game_id, platform_id)
SELECT UUID(), g.game_id, p.platform_id FROM games g, platforms p
WHERE (g.slug = 'halo-infinite'             AND p.name IN ('Xbox Series X', 'Xbox One', 'PC (Steam)'))
   OR (g.slug = 'shadow-of-the-tomb-raider' AND p.name IN ('PlayStation 4', 'Xbox One', 'PC (Steam)'))
   OR (g.slug = 'witcher-3-wild-hunt'        AND p.name IN ('PlayStation 5', 'PlayStation 4', 'Xbox Series X', 'PC (Steam)', 'Nintendo Switch'))
   OR (g.slug = 'minecraft'                  AND p.name IN ('PC (Steam)', 'PlayStation 4', 'Xbox One', 'Nintendo Switch', 'iOS', 'Android'))
   OR (g.slug = 'horizon-zero-dawn'          AND p.name IN ('PlayStation 4', 'PC (Steam)'))
   OR (g.slug = 'god-of-war-2018'            AND p.name IN ('PlayStation 4', 'PlayStation 5', 'PC (Steam)'))
   OR (g.slug = 'elden-ring'                 AND p.name IN ('PlayStation 5', 'PlayStation 4', 'Xbox Series X', 'PC (Steam)'))
   OR (g.slug = 'cyberpunk-2077'             AND p.name IN ('PlayStation 5', 'Xbox Series X', 'PC (Steam)'))
   OR (g.slug = 'starfield'                  AND p.name IN ('Xbox Series X', 'PC (Steam)'))
   OR (g.slug = 'gta-vi'                     AND p.name IN ('PlayStation 5', 'Xbox Series X'))
   OR (g.slug = 'marvels-wolverine'          AND p.name IN ('PlayStation 5'));


-- =============================================================
--  TRAILERS
-- =============================================================

INSERT INTO trailers (trailer_id, game_id, title, type, video_url, poster_url, sort_order)
SELECT UUID(), g.game_id, t.title, t.type, t.video_url, t.poster_url, t.sort_order
FROM games g
JOIN (
    SELECT 'halo-infinite'             AS slug, 'Halo Infinite — Campaign Trailer'          AS title, 'official'  AS type, 'https://www.youtube.com/watch?v=PyMlV5_HRWk' AS video_url, NULL AS poster_url, 1 AS sort_order UNION ALL
    SELECT 'shadow-of-the-tomb-raider',          'Shadow of the Tomb Raider — Reveal Trailer', 'official',  'https://www.youtube.com/watch?v=XYtyeqVQnRI', NULL, 1 UNION ALL
    SELECT 'witcher-3-wild-hunt',                'The Witcher 3 — Opening Cinematic',           'cinematic', 'https://www.youtube.com/watch?v=c0i88t0Kacs', NULL, 1 UNION ALL
    SELECT 'witcher-3-wild-hunt',                'The Witcher 3 — Gameplay Deep Dive',          'gameplay',  'https://www.youtube.com/watch?v=XIe5OiyZBgo', NULL, 2 UNION ALL
    SELECT 'minecraft',                          'Minecraft — Caves & Cliffs Trailer',          'official',  'https://www.youtube.com/watch?v=MmB9b5njVbA', NULL, 1 UNION ALL
    SELECT 'horizon-zero-dawn',                  'Horizon Zero Dawn — Story Trailer',           'official',  'https://www.youtube.com/watch?v=wzx96gYA8ek', NULL, 1 UNION ALL
    SELECT 'god-of-war-2018',                    'God of War — Reveal Trailer',                 'cinematic', 'https://www.youtube.com/watch?v=K0u_kAWLJOA', NULL, 1 UNION ALL
    SELECT 'elden-ring',                         'Elden Ring — Official Trailer',               'official',  'https://www.youtube.com/watch?v=E3Huy2cdih0', NULL, 1 UNION ALL
    SELECT 'cyberpunk-2077',                     'Cyberpunk 2077 — Launch Trailer',             'launch',    'https://www.youtube.com/watch?v=8X2kIfS6fb8', NULL, 1 UNION ALL
    SELECT 'starfield',                          'Starfield — Official Trailer',                'official',  'https://www.youtube.com/watch?v=pYqyVpCV-3c', NULL, 1 UNION ALL
    SELECT 'gta-vi',                             'GTA VI — Trailer 1',                          'official',  'https://www.youtube.com/watch?v=QdBZExpgErs', NULL, 1 UNION ALL
    SELECT 'marvels-wolverine',                  'Marvel''s Wolverine — Reveal Trailer',        'teaser',    'https://www.youtube.com/watch?v=HsxNBuHFJQA', NULL, 1
) t ON g.slug = t.slug;


-- =============================================================
--  UPCOMING RELEASES
-- =============================================================

INSERT INTO upcoming_releases (release_id, game_id, release_date, release_window, description, featured)
SELECT UUID(), g.game_id, u.release_date, u.release_window, u.description, u.featured
FROM games g
JOIN (
    SELECT 'gta-vi'           AS slug, NULL        AS release_date, '2025'         AS release_window, 'La secuela más esperada de la historia de los videojuegos.'       AS description, TRUE  AS featured UNION ALL
    SELECT 'marvels-wolverine',        NULL,                         '2026',                           'Insomniac Games trae al Lagarto más salvaje de Marvel.',           TRUE UNION ALL
    SELECT 'starfield',                '2024-09-01',                 NULL,                             'Expansión Shattered Space: nuevos planetas y misterios estelares.', FALSE
) u ON g.slug = u.slug;


-- =============================================================
--  NOTICIAS
-- =============================================================

INSERT INTO news (news_id, title, slug, summary, content, featured, published_at)
VALUES
(UUID(),
 'GTA VI: Todo lo que sabemos del lanzamiento más esperado',
 'gta-vi-todo-lo-que-sabemos',
 'Rockstar Games confirmó que GTA VI llegará en 2025. Repasamos todo lo revelado hasta ahora.',
 'Rockstar Games sorprendió al mundo con el primer tráiler de Grand Theft Auto VI en diciembre de 2023. La nueva entrega regresa a Vice City con una protagonista femenina por primera vez en la saga principal. El juego promete ser el más grande y ambicioso de la historia del estudio. Se espera un mapa gigantesco, historia ramificada, y multijugador revolucionario. La fecha de lanzamiento oficial aún no se ha confirmado, pero todo apunta al otoño de 2025.',
 TRUE,
 DATE_SUB(NOW(), INTERVAL 2 DAY)),

(UUID(),
 'The Witcher 4 entra en plena producción según CD Projekt Red',
 'witcher-4-produccion-cd-projekt',
 'CD Projekt Red anuncia que The Witcher 4 ya está en producción completa con el motor Unreal Engine 5.',
 'Tras años de desarrollo con el REDengine, CD Projekt Red ha dado el salto a Unreal Engine 5 para la cuarta entrega de The Witcher. El estudio confirma que el juego presentará a Ciri como protagonista principal, marcando un nuevo capítulo en la saga. Los fans pueden esperar un mundo aún más detallado y una historia que profundiza en el lore establecido por Geralt.',
 FALSE,
 DATE_SUB(NOW(), INTERVAL 5 DAY)),

(UUID(),
 'Elden Ring: Shadow of the Erdtree bate récords de ventas',
 'elden-ring-shadow-erdtree-records',
 'La expansión de Elden Ring se convierte en el DLC más vendido de la historia de FromSoftware.',
 'Shadow of the Erdtree superó todas las expectativas de ventas al ser lanzado. La expansión añade nuevas áreas, jefes, armas y una historia que complementa perfectamente el juego base. Los jugadores han elogiado el nivel de detalle y la dificultad desafiante que caracteriza a los juegos de FromSoftware.',
 FALSE,
 DATE_SUB(NOW(), INTERVAL 10 DAY));


-- =============================================================
--  FIN DEL SEED
-- =============================================================
-- Juegos     : 11
-- Géneros    : Asignados por nombre (subquery)
-- Plataformas: Asignadas por nombre (subquery)
-- Trailers   : 12
-- Upcoming   : 3
-- Noticias   : 3
-- =============================================================
