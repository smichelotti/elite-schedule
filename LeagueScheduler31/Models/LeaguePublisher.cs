using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Web;

namespace LeagueScheduler.Models
{
    public class LeaguePublisher
    {
        public void Publish(int leagueId)
        {
            try
            {
                var jsonBuilder = new LeagueJsonBuilder();
                var json = jsonBuilder.CreateJson(leagueId);
                var scheduleRepository = new ScheduleRepository();
                var leagueRepository = new LeagueRepository();

                var league = leagueRepository.Find(leagueId);
                league.IsActive = true;
                scheduleRepository.Save(league.Id, league.Name, json);
                leagueRepository.MarkClean(leagueId);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Trace.TraceError(ex.ToString());
                throw;
            }
        }

        //public string xPublish(int leagueId)
        //{
        //    var games = (from g in dbContext.Games.Include("Location")
        //                 where g.LeagueId == leagueId
        //                 orderby g.GameTime, g.LeagueId
        //                 select g).ToList();
        //    var teams = dbContext.Teams.Where(t => t.LeagueId == leagueId).OrderBy(t => t.Name).ToList();
        //    var teamsDict = teams.ToDictionary(k => k.Id);
        //    var leagueLocationIds = games.Select(x => x.LocationId).Distinct().ToList();
        //    var locations = (from l in dbContext.Locations
        //                     join id in leagueLocationIds on l.Id equals id
        //                     select l).OrderBy(x => x.Name).ToList();
        //    //var locationDict = locations.ToDictionary(x => x.Id);
        //    var league = dbContext.Leagues.Single(x => x.Id == leagueId);

        //    StringBuilder sb = new StringBuilder();
        //    using (StringWriter sw = new StringWriter(sb))
        //    using (var writer = new JsonTextWriter(sw))
        //    {
        //        writer.Formatting = Formatting.Indented;

        //        writer.WriteStartObject();
        //        WriteLeague(writer, league);
        //        WriteTeams(writer, teams);
        //        WriteLocations(writer, locations);
        //        WriteGames(writer, games, teamsDict);
        //        writer.WriteEndObject();

        //        var json = sw.ToString();

        //        var repository = new ScheduleRepository();
        //        repository.Save(league.Id, league.Name, json);
        //        return json;
        //    }
        //}

        //private void WriteLeague(JsonWriter json, League league)
        //{
        //    json.WritePropertyName("league");

        //    json.WriteStartObject();
        //    json.WriteProperty("name", league.Name);
        //    json.WriteProperty("id", league.Id);
        //    json.WriteEnd();
        //}

        //private void WriteTeams(JsonWriter json, List<Team> teams)
        //{
        //    json.WritePropertyName("teams");
        //    json.WriteStartArray();
        //    teams = teams.OrderBy(x => x.Name).ToList();

        //    foreach (var team in teams)
        //    {
        //        json.WriteStartObject();
        //        json.WriteProperty("name", team.Name);
        //        json.WriteEnd();
        //    }
        //    json.WriteEnd();
        //}

        //private void WriteLocations(JsonWriter json, List<Location> locations)
        //{
        //    json.WritePropertyName("locations");
        //    json.WriteStartArray();

        //    foreach (var location in locations)
        //    {
        //        json.WriteStartObject();
        //        json.WriteProperty("name", location.Name);
        //        json.WriteProperty("locationUrl", location.Link);
        //        json.WriteEnd();
        //    }
        //    json.WriteEnd();
        //}

        //private void WriteGames(JsonWriter json, List<Game> games, Dictionary<int, Team> teams)
        //{
        //    json.WritePropertyName("games");
        //    json.WriteStartArray();

        //    foreach (var game in games)
        //    {
        //        json.WriteStartObject();
        //        json.WriteProperty("id", game.Id);
        //        json.WriteProperty("location", game.Location.Name);
        //        json.WriteProperty("locationUrl", game.Location.Link);
        //        json.WriteProperty("team1", teams[game.Team1Id].Name);
        //        json.WriteProperty("team2", teams[game.Team2Id].Name);
        //        json.WriteProperty("time", game.GameTime.ToString("yyyy-MM-ddTHH:mm:00"));
        //        json.WriteEnd();
        //    }
        //    json.WriteEnd();
        //}
       
    }
}