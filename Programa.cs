using System;

class Program
{
    static void Main()
    {
        const int limite = 9000;
        int poder = 8999;
        bool acabou = false;
        while ((!acabou))
        {
            if ((poder > limite))
            {
                Console.WriteLine("It's Over 9000!");
                acabou = true;
            }
            else
            {
                if ((poder == limite))
                {
                    Console.WriteLine("Not Bad");
                }
                else
                {
                    Console.WriteLine("Forever Alone");
                }
            }
            poder = (poder + 1);
        }
    }
}
