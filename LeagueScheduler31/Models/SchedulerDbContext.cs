using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Data.Entity;

namespace LeagueScheduler.Models
{
    public class SchedulerDbContext : DbContext
    {
        public SchedulerDbContext() : base("name=LeagueLineupDB")
        {
        }

        public DbSet<League> Leagues { get; set; }

        public DbSet<Location> Locations { get; set; }

        public DbSet<Team> Teams { get; set; }

        public DbSet<Game> Games { get; set; }

        public DbSet<Slot> Slots { get; set; }
    }
}