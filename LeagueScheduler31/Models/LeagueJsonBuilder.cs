using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text;
using System.Web;

namespace LeagueScheduler.Models
{
    public class LeagueJsonBuilder
    {
        private SchedulerDbContext dbContext = new SchedulerDbContext();


        public string CreateJson(int leagueId)
        {
            var games = (from g in dbContext.Games.Include("Location")
                         where g.LeagueId == leagueId
                         orderby g.GameTime, g.LeagueId
                         select g).ToList();
            var teams = dbContext.Teams.Where(t => t.LeagueId == leagueId).OrderBy(t => t.Name).ToList();
            var teamsDict = teams.ToDictionary(k => k.Id);
            var leagueLocationIds = games.Select(x => x.LocationId).Distinct().ToList();
            var locations = (from l in dbContext.Locations
                             join id in leagueLocationIds on l.Id equals id
                             select l).OrderBy(x => x.Name).ToList();
            var league = dbContext.Leagues.Single(x => x.Id == leagueId);

            StringBuilder sb = new StringBuilder();
            using (StringWriter sw = new StringWriter(sb))
            using (var writer = new JsonTextWriter(sw))
            {
                writer.Formatting = Formatting.Indented;

                writer.WriteStartObject();
                WriteLeague(writer, league);
                WriteTeams(writer, teams);
                WriteLocations(writer, locations);
                WriteGames(writer, games, teamsDict);
                WriteStandings(writer, games, teamsDict);
                writer.WriteEndObject();

                var json = sw.ToString();

                //var repository = new ScheduleRepository();
                //repository.Save(league.Id, league.Name, json);
                return json;
            }
        }

        private void WriteLeague(JsonWriter json, League league)
        {
            json.WritePropertyName("league");

            json.WriteStartObject();
            json.WriteProperty("name", league.Name);
            json.WriteProperty("id", league.Id);
            json.WriteEnd();
        }

        private void WriteTeams(JsonWriter json, List<Team> teams)
        {
            json.WritePropertyName("teams");
            json.WriteStartArray();
            teams = teams.OrderBy(x => x.Name).ToList();

            foreach (var team in teams)
            {
                json.WriteStartObject();
                json.WriteProperty("name", team.Name);
                json.WriteEnd();
            }
            json.WriteEnd();
        }

        private void WriteLocations(JsonWriter json, List<Location> locations)
        {
            json.WritePropertyName("locations");
            json.WriteStartArray();

            foreach (var location in locations)
            {
                json.WriteStartObject();
                json.WriteProperty("name", location.Name);
                json.WriteProperty("locationUrl", location.Link);
                json.WriteEnd();
            }
            json.WriteEnd();
        }

        private void WriteGames(JsonWriter json, List<Game> games, Dictionary<int, Team> teams)
        {
            json.WritePropertyName("games");
            json.WriteStartArray();

            foreach (var game in games)
            {
                json.WriteStartObject();
                json.WriteProperty("id", game.Id);
                json.WriteProperty("location", game.Location.Name);
                json.WriteProperty("locationUrl", game.Location.Link);
                json.WriteProperty("team1", teams[game.Team1Id].Name);
                json.WriteProperty("team2", teams[game.Team2Id].Name);
                json.WriteProperty("time", game.GameTime.ToString("yyyy-MM-ddTHH:mm:00"));
                json.WriteEnd();
            }
            json.WriteEnd();
        }

        private void WriteStandings(JsonWriter json, List<Game> games, Dictionary<int, Team> teams)
        {
            var standings = ConstructStandings(games, teams);
            json.WritePropertyName("standings");
            json.WriteStartArray();

            foreach (var standing in standings)
            {
                json.WriteStartObject();
                json.WriteProperty("teamName", standing.TeamName);
                json.WriteProperty("wins", standing.Wins);
                json.WriteProperty("losses", standing.Losses);
                json.WriteProperty("winningPct", standing.WinningPct.ToString("#.000"));
                json.WriteProperty("pointsFor", standing.PointsFor);
                json.WriteProperty("pointsAgainst", standing.PointsAgainst);
                json.WriteProperty("pointsDiff", standing.PointsDiff);
                json.WriteEnd();
            }
            json.WriteEnd();
        }

        private static List<StandingsItem> ConstructStandings(List<Game> games, Dictionary<int, Team> teams)
        {
            var standings = teams.Values.ToDictionary(x => x.Id, x => new StandingsItem { TeamId = x.Id, TeamName = x.Name });

            foreach (var game in games)
            {
                //TODO: defer implementation for a tie
                var winningTeamId = game.Team1Score.GetValueOrDefault() > game.Team2Score.GetValueOrDefault() ? game.Team1Id : game.Team2Id;
                PopulateSingleStanding(standings[game.Team1Id], game.Team1Score.GetValueOrDefault(), game.Team2Score.GetValueOrDefault(), winningTeamId);
                PopulateSingleStanding(standings[game.Team2Id], game.Team2Score.GetValueOrDefault(), game.Team1Score.GetValueOrDefault(), winningTeamId);
            }

            return standings.Values.OrderByDescending(x => x.WinningPct).ThenByDescending(x => x.Wins).ThenByDescending(x => x.PointsDiff).ToList(); ;
        }

        private static void PopulateSingleStanding(StandingsItem standing, int teamScore, int opponentScore, int winningTeamId)
        {
            standing.PointsFor += teamScore;
            standing.PointsAgainst += opponentScore;
            if (winningTeamId == standing.TeamId)
            {
                standing.Wins += 1;
            }
            else
            {
                standing.Losses += 1;
            }
        }
    }

    class StandingsItem
    {
        public int TeamId { get; set; }
        public string TeamName { get; set; }
        public int Wins { get; set; }
        public int Losses { get; set; }
        public int Ties { get; set; }
        public int PointsFor { get; set; }
        public int PointsAgainst { get; set; }

        // Read-Only
        public decimal WinningPct
        {
            get
            {
                var totalGames = this.Wins + this.Losses;
                if (totalGames == 0)
                {
                    return 0;
                }
                return (decimal)this.Wins / totalGames;
            }
        }

        // Does PointsDiff need to factor in a "max diff"?
        public int PointsDiff
        {
            get
            {
                return this.PointsFor - this.PointsAgainst;
            }
        }

        // Questionable
        // Games Back
        // Streak
    }

    static class JsonExtensions
    {
        public static void WriteProperty(this JsonWriter writer, string propertyName, string propertyValue)
        {
            writer.WritePropertyName(propertyName);
            writer.WriteValue(propertyValue);
        }

        public static void WriteProperty(this JsonWriter writer, string propertyName, bool propertyValue)
        {
            writer.WritePropertyName(propertyName);
            writer.WriteValue(propertyValue);
        }

        public static void WriteProperty(this JsonWriter writer, string propertyName, int propertyValue)
        {
            writer.WritePropertyName(propertyName);
            writer.WriteValue(propertyValue);
        }
    }
}