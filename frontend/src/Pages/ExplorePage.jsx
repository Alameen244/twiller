import { useMemo, useState } from "react";
import {
  Box,
  IconButton,
  InputBase,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import {
  Close,
  MoreHoriz,
  Search,
  SettingsOutlined,
  SportsCricket,
  Terminal,
  MovieCreation,
  Public,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const NEWS_ITEMS = [
  {
    id: "news-1",
    category: "sports",
    headline: "IPL 2027 Pre-Season Roster Shakeup Sparks Opening Match Hype",
    meta: "2 days ago · Sports · 58.4K posts",
    avatars: ["#1d9bf0", "#00ba7c", "#f91880"],
    gradient: "linear-gradient(135deg, #0b2239 0%, #1d9bf0 100%)",
    Icon: SportsCricket,
  },
  {
    id: "news-2",
    category: "news",
    headline: "Open-Source Edge Runtimes Gain Traction Across Modern Full-Stack Apps",
    meta: "1 day ago · Technology · 183.1K posts",
    avatars: ["#f59e0b", "#1d9bf0", "#8b5cf6"],
    gradient: "linear-gradient(135deg, #1b1f2a 0%, #3b82f6 100%)",
    Icon: Public,
  },
  {
    id: "news-3",
    category: "sports",
    headline: "Global Esports Finals Set New Concurrent Viewership Record",
    meta: "3 hours ago · Sports · 65.9K posts",
    avatars: ["#10b981", "#ec4899", "#6366f1"],
    gradient: "linear-gradient(135deg, #0f172a 0%, #00ba7c 100%)",
    Icon: Terminal,
  },
  {
    id: "news-4",
    category: "entertainment",
    headline: "Independent Sci-Fi Anthology Tops Weekend Streaming Charts Globally",
    meta: "5 hours ago · Entertainment · 91.2K posts",
    avatars: ["#ec4899", "#f97316", "#eab308"],
    gradient: "linear-gradient(135deg, #2d112b 0%, #f91880 100%)",
    Icon: MovieCreation,
  },
];

const TREND_ITEMS = [
  { id: "tr-1", category: "sports", labelKey: "explore.catSportsTrending", title: "Rohit Sharma", posts: "42.8K posts" },
  { id: "tr-2", category: "sports", labelKey: "explore.catSportsTrending", title: "Shubman Gill", posts: "29.4K posts" },
  { id: "tr-3", category: "entertainment", labelKey: "explore.catEntTrending", title: "Dune: Messiah", posts: "64.1K posts" },
  { id: "tr-4", category: "news", labelKey: "explore.catTechTrending", title: "React 19", posts: "51.7K posts" },
  { id: "tr-5", category: "sports", labelKey: "explore.catSportsTrending", title: "Champions League", posts: "118K posts" },
  { id: "tr-6", category: "news", labelKey: "explore.catRegionTrending", title: "#WebPerformance", posts: "18.3K posts" },
  { id: "tr-7", category: "entertainment", labelKey: "explore.catEntTrending", title: "Soundtrack of the Year", posts: "22.9K posts" },
];

const TAB_KEYS = ["explore", "trending", "news", "sports", "entertainment"];

export default function ExplorePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [query, setQuery] = useState("");

  const activeCategory = TAB_KEYS[tab];
  const normalizedQuery = query.trim().toLowerCase();

  const visibleNews = useMemo(() => {
    return NEWS_ITEMS.filter((item) => {
      const catMatch =
        activeCategory === "explore" ||
        activeCategory === "trending" ||
        item.category === activeCategory;
      const queryMatch =
        !normalizedQuery ||
        item.headline.toLowerCase().includes(normalizedQuery) ||
        item.meta.toLowerCase().includes(normalizedQuery);
      return catMatch && queryMatch;
    }).slice(0, 3);
  }, [activeCategory, normalizedQuery]);

  const visibleTrends = useMemo(() => {
    return TREND_ITEMS.filter((item) => {
      const catMatch =
        activeCategory === "explore" ||
        activeCategory === "trending" ||
        item.category === activeCategory;
      const queryMatch =
        !normalizedQuery ||
        item.title.toLowerCase().includes(normalizedQuery) ||
        item.posts.toLowerCase().includes(normalizedQuery);
      return catMatch && queryMatch;
    });
  }, [activeCategory, normalizedQuery]);

  return (
    <Box data-component="explore-page" sx={{ minHeight: "100dvh", bgcolor: "#000" }}>
      {/* Sticky Search + Tabs Header */}
      <Box
        sx={{
          position: "sticky",
          top: { xs: 53, sm: 0 },
          zIndex: 2,
          bgcolor: "rgba(0,0,0,0.9)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid #2f3336",
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.5}
          sx={{ px: 2, pt: 1.25, pb: 0.75 }}
        >
          <Box
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: 1,
              bgcolor: "#202327",
              borderRadius: 99,
              px: 1.75,
              py: 0.75,
              border: "1px solid transparent",
              "&:focus-within": {
                bgcolor: "#000",
                borderColor: "#1d9bf0",
              },
            }}
          >
            <Search sx={{ color: "#71767b", fontSize: 20 }} />
            <InputBase
              fullWidth
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("explore.searchPlaceholder")}
              inputProps={{ "aria-label": t("explore.searchPlaceholder") }}
              sx={{
                color: "#e7e9ea",
                fontSize: 15,
                "& input::placeholder": { color: "#71767b", opacity: 1 },
              }}
            />
            {query && (
              <IconButton
                size="small"
                aria-label="Clear search"
                onClick={() => setQuery("")}
                sx={{ color: "#1d9bf0", p: 0.25 }}
              >
                <Close sx={{ fontSize: 17 }} />
              </IconButton>
            )}
          </Box>
          <IconButton
            aria-label={t("nav.settings")}
            onClick={() => navigate("/settings")}
            sx={{ color: "#e7e9ea" }}
          >
            <SettingsOutlined fontSize="small" />
          </IconButton>
        </Stack>

        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="scrollable"
          scrollButtons={false}
          sx={{
            minHeight: 46,
            "& .MuiTab-root": {
              color: "#71767b",
              textTransform: "none",
              fontWeight: 700,
              fontSize: 14.5,
              minHeight: 46,
              flex: 1,
              minWidth: 88,
            },
            "& .Mui-selected": { color: "#e7e9ea" },
            "& .MuiTabs-indicator": { bgcolor: "#1d9bf0", height: 3, borderRadius: 2 },
          }}
        >
          <Tab label={t("explore.tabExplore")} />
          <Tab label={t("explore.tabTrending")} />
          <Tab label={t("explore.tabNews")} />
          <Tab label={t("explore.tabSports")} />
          <Tab label={t("explore.tabEntertainment")} />
        </Tabs>
      </Box>

      {/* Today's News Section */}
      {visibleNews.length > 0 && (
        <Box sx={{ borderBottom: "1px solid #2f3336", py: 1.5 }}>
          <Typography
            fontSize={20}
            fontWeight={800}
            sx={{ px: 2, pb: 1, color: "#e7e9ea" }}
          >
            {t("explore.todaysNews")}
          </Typography>

          <Stack>
            {visibleNews.map((story) => {
              const ThumbIcon = story.Icon;
              return (
                <Stack
                  key={story.id}
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  spacing={2}
                  sx={{
                    px: 2,
                    py: 1.5,
                    cursor: "pointer",
                    transition: "background-color 0.15s ease",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.03)" },
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      fontWeight={700}
                      fontSize={15}
                      lineHeight={1.35}
                      color="#e7e9ea"
                      sx={{ mb: 0.75 }}
                    >
                      {story.headline}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Box sx={{ display: "flex", alignItems: "center" }} aria-hidden="true">
                        {story.avatars.map((bg, idx) => (
                          <Box
                            key={bg}
                            sx={{
                              width: 18,
                              height: 18,
                              borderRadius: "50%",
                              bgcolor: bg,
                              border: "2px solid #000",
                              ml: idx === 0 ? 0 : -0.75,
                            }}
                          />
                        ))}
                      </Box>
                      <Typography fontSize={13} color="#71767b" noWrap>
                        {story.meta}
                      </Typography>
                    </Stack>
                  </Box>

                  <Box
                    aria-hidden="true"
                    sx={{
                      width: 72,
                      height: 72,
                      borderRadius: 2.5,
                      background: story.gradient,
                      border: "1px solid rgba(255,255,255,0.12)",
                      display: "grid",
                      placeItems: "center",
                      flexShrink: 0,
                      color: "rgba(255,255,255,0.92)",
                    }}
                  >
                    <ThumbIcon sx={{ fontSize: 30 }} />
                  </Box>
                </Stack>
              );
            })}
          </Stack>
        </Box>
      )}

      {/* Trending Topics List */}
      {visibleTrends.length > 0 ? (
        <Stack>
          {visibleTrends.map((trend) => (
            <Stack
              key={trend.id}
              direction="row"
              alignItems="flex-start"
              justifyContent="space-between"
              sx={{
                px: 2,
                py: 1.5,
                cursor: "pointer",
                transition: "background-color 0.15s ease",
                "&:hover": { bgcolor: "rgba(255,255,255,0.03)" },
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography fontSize={13} color="#71767b">
                  {t(trend.labelKey)}
                </Typography>
                <Typography fontSize={15} fontWeight={700} color="#e7e9ea" mt={0.25}>
                  {trend.title}
                </Typography>
                <Typography fontSize={13} color="#71767b" mt={0.25}>
                  {trend.posts}
                </Typography>
              </Box>
              <IconButton size="small" aria-label="More options" sx={{ color: "#71767b" }}>
                <MoreHoriz fontSize="small" />
              </IconButton>
            </Stack>
          ))}
        </Stack>
      ) : (
        visibleNews.length === 0 && (
          <Typography color="#71767b" textAlign="center" py={6} px={2}>
            {t("explore.noResults")}
          </Typography>
        )
      )}
    </Box>
  );
}
