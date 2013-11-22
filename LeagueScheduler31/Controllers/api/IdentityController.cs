using LeagueScheduler.Models;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Security.Claims;
using System.Web.Http;

namespace LeagueScheduler.Controllers.api
{
    [RoutePrefix("api/identity")]
    public class IdentityController : ApiController
    {
        private UserManager<ApplicationUser> userManager = new UserManager<ApplicationUser>(new UserStore<ApplicationUser>(new ApplicationDbContext()));

        [Route("info")]
        public object GetIdentityInfo()
        {
            var userId = this.User.Identity.GetUserId();
            return new
            {
                name = this.User.Identity.Name,
                roles = this.userManager.GetRoles(userId),
                claims = this.userManager.GetClaims(userId).Select(c => new { c.Type, c.Value }).ToList()
            };
        }

        [Route("roles")]
        public IList<string> GetRoles()
        {
            var userId = this.User.Identity.GetUserId();
            //var roles = this.userManager.GetRoles("3ddfcdbf-9fed-4809-86d8-e2b88b36193f");
            var roles = this.userManager.GetRoles(userId);
            return roles;
        }

        [Route("claims")]
        public object GetClaims()
        {
            var claims = this.userManager.GetClaims("3ddfcdbf-9fed-4809-86d8-e2b88b36193f");
            return claims.Select(c => new { c.Type, c.Value }).ToList();
        }
    }
}
