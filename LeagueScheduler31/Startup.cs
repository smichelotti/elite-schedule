using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(LeagueScheduler.Startup))]
namespace LeagueScheduler
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
