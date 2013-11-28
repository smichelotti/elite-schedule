using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace LeagueScheduler
{
    public class RouteConfig
    {
        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

            routes.MapRoute(
                name: "LeagueDefault",
                url: "{id}",
                defaults: new { controller = "Home", action = "League" },
                constraints: new { id = @"\d+" }
            );

            routes.MapRoute(
                name: "LeaguePreview",
                url: "{id}/preview",
                defaults: new { controller = "Home", action = "League" },
                constraints: new { id = @"\d+" }
            );

            routes.MapRoute(
                name: "Default",
                url: "{controller}/{action}/{id}",
                defaults: new { controller = "Home", action = "Index", id = UrlParameter.Optional }
            );
        }
    }
}
