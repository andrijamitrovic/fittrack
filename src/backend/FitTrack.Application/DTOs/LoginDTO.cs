using System;
using System.Collections.Generic;
using System.Text;

namespace FitTrack.Application.DTOs
{
    public class LoginDTO
    {
        public required string Email { get; set; }
        public required string Password { get; set; }
    }
}
