using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Data.Entity;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using Microsoft.Owin.Security;
using System.Security.Claims;

namespace LeagueScheduler.Models
{
    public class SchedulerDbInitializer : DropCreateDatabaseIfModelChanges<SchedulerDbContext>
    {
        protected override void Seed(SchedulerDbContext context)
        {

            UserDataInitializer.Seed();

           
        }
    }

    static class UserDataInitializer
    {
        public static void Seed()
        {
            var dbContext = new ApplicationDbContext();
            var roleManager = new RoleManager<IdentityRole>(new RoleStore<IdentityRole>(dbContext));
            var userManager = new UserManager<IdentityUser>(new UserStore<IdentityUser>(dbContext));
            //var httpContext = new HttpContextWrapper(HttpContext.Current);
            //var authenticationManager = httpContext.GetOwinContext().Authentication;
            //var info = authenticationManager.GetExternalLoginInfo();

            

            // Create Roles
            roleManager.Create(new IdentityRole("Admin"));
            roleManager.Create(new IdentityRole("LeagueEditor"));

            // Create User
            var user = new ApplicationUser() { UserName = "smichelotti" };
            var userCreatedResult = userManager.Create(user);

            // Add Login
            if (userCreatedResult.Succeeded)
            {
                var userLoginInfo = new UserLoginInfo("Google", "https://www.google.com/accounts/o8/id?id=AItOawnjH-yF3xhOKQQDCVfCGV-kS4Al55VfEVU");
                var loginResult = userManager.AddLogin(user.Id, userLoginInfo);

                if (loginResult.Succeeded)
                {
                    // Add Roles
                    userManager.AddToRole(user.Id, "Admin");
                    userManager.AddToRole(user.Id, "LeagueEditor");

                    // Add Claims
                    userManager.AddClaim(user.Id, new Claim("SuperUser", "true"));

                    userManager.AddClaim(user.Id, new Claim("AdminSiteUser", "true"));
                    
                    userManager.AddClaim(user.Id, new Claim("DeleteLeague", "true"));
                    userManager.AddClaim(user.Id, new Claim("DeleteLocation", "true"));
                }
            }
        }
    }
}