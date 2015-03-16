using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Web;

namespace LeagueScheduler.Models
{
    public class CustomClaimsManager
    {
        //private UserManager<ApplicationUser> userManager = new UserManager<ApplicationUser>(new UserStore<ApplicationUser>(new ApplicationDbContext()));

        public List<Claim> GetCustomClaims(string userId)
        {
            var dbContext = new SchedulerDbContext();
            var userLeagues = dbContext.LeagueUsers.Where(x => x.UserId == userId).ToList();

            var canDeleteLeague = userLeagues.Where(x => x.Permission == "league-owner").Select(x => x.LeagueId);
            var canEditLeague = userLeagues.Where(x => x.Permission == "league-owner" || x.Permission == "league-co-admin").Select(x => x.LeagueId);
            var canEditScores = userLeagues
                .Where(x => x.Permission == "league-owner" || x.Permission == "league-co-admin" || x.Permission == "league-score-editor")
                .Select(x => x.LeagueId);

            var claims = new List<Claim>();
            claims.Add(new Claim("can-delete-league", string.Join(",", canDeleteLeague)));
            claims.Add(new Claim("can-edit-league", string.Join(",", canEditLeague)));
            claims.Add(new Claim("can-edit-scores", string.Join(",", canEditScores)));
            return claims;
        }
    }
}