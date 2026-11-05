import unittest

from ragelang.compiler import SemanticError, compile_source
from ragelang.lexer import Lexer, LexicalError
from ragelang.parser import ParseError, Parser


class RageLangTests(unittest.TestCase):
    def test_lexical_error(self):
        with self.assertRaises(LexicalError): Lexer("POKER_FACE OVER_9000 x = @;").tokenize()

    def test_syntax_error(self):
        tokens = Lexer("POKER_FACE OVER_9000 x = 1").tokenize()
        with self.assertRaises(ParseError): Parser(tokens).parse()

    def test_undeclared_variable(self):
        with self.assertRaises(SemanticError): compile_source('CEREAL_GUY(x);')

    def test_type_error(self):
        with self.assertRaises(SemanticError): compile_source('POKER_FACE OVER_9000 x = "texto";')

    def test_constant_error(self):
        with self.assertRaises(SemanticError): compile_source('TRUE_STORY OVER_9000 limite = 3; limite = 4;')

    def test_generation(self):
        source = '''
        POKER_FACE OVER_9000 idade = 20;
        DERP (idade >= 18) { CEREAL_GUY("Maior"); } I_LIED { CEREAL_GUY("Menor"); }
        '''
        output = compile_source(source)
        self.assertIn('int idade = 20;', output)
        self.assertIn('if ((idade >= 18))', output)
        self.assertIn('Console.WriteLine("Maior");', output)

    def test_loop_and_comments(self):
        output = compile_source('// comentário\nPOKER_FACE OVER_9000 i = 0; FOREVER_ALONE (i < 2) { i = i + 1; }')
        self.assertIn('while ((i < 2))', output)
        self.assertIn('i = (i + 1);', output)


if __name__ == "__main__":
    unittest.main()
