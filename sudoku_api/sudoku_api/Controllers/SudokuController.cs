using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using sudoku_api.Models;

namespace sudoku_api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SudokuController : ControllerBase
    {
        private readonly SudokuAPIContext _context;

        public SudokuController(SudokuAPIContext context)
        {
            _context = context;
        }

        // GET: api/Sudoku
        [HttpGet]
        [EnableCors]
        public async Task<ActionResult<IEnumerable<SudokuSolverData>>> GetSudokuSolverData()
        {
            return await _context.SudokuSolverData.ToListAsync();
        }

        // GET: api/Sudoku/5
        [HttpGet("{id}")]
        public async Task<ActionResult<SudokuSolverData>> GetSudokuSolverData(int id)
        {
            var sudokuSolverData = await _context.SudokuSolverData.FindAsync(id);

            if (sudokuSolverData == null)
            {
                return NotFound();
            }

            return sudokuSolverData;
        }

        // PUT: api/Sudoku/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutSudokuSolverData(int id, SudokuSolverData sudokuSolverData)
        {
            if (id != sudokuSolverData.Id)
            {
                return BadRequest();
            }

            _context.Entry(sudokuSolverData).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!SudokuSolverDataExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/Sudoku
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<SudokuSolverData>> PostSudokuSolverData(SudokuSolverData sudokuSolverData)
        {
            _context.SudokuSolverData.Add(sudokuSolverData);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetSudokuSolverData", new { id = sudokuSolverData.Id }, sudokuSolverData);
        }

        // DELETE: api/Sudoku/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSudokuSolverData(int id)
        {
            var sudokuSolverData = await _context.SudokuSolverData.FindAsync(id);
            if (sudokuSolverData == null)
            {
                return NotFound();
            }

            _context.SudokuSolverData.Remove(sudokuSolverData);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool SudokuSolverDataExists(int id)
        {
            return _context.SudokuSolverData.Any(e => e.Id == id);
        }
    }
}
