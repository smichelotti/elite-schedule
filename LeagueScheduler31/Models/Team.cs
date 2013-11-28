using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace LeagueScheduler.Models
{
    public class Team 
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Division { get; set; }

        public int LeagueId { get; set; }
        public League League { get; set; }
        
    }
}