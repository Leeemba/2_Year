
using System;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

class Workshop5
{
    static async Task Main()
    {
        var stopwatch = Stopwatch.StartNew();

        var files = Directory.GetFiles("D:/yDownloads/LAB5");

        var tasks = files.Select(async file =>
        {
            var text = await File.ReadAllTextAsync(file);
            var wordCount = text
                .Split([' ', '\n', '\r', '\t', ',', '.', '!', '?', ';', ':', '"'],
                       StringSplitOptions.RemoveEmptyEntries)
                .Length;

            return $"{Path.GetFileName(file)} → {wordCount} слов";
        });

        await foreach (var result in Task.WhenEach(tasks))
        {
            Console.WriteLine(await result);
        }

        stopwatch.Stop();
        Console.WriteLine($"\nВремя выполнения: {stopwatch.ElapsedMilliseconds} мс");
    }
}
