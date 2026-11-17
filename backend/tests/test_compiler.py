import unittest
from ragelang.compiler import SemanticError, compile_source
from ragelang.lexer import Lexer, LexicalError
from ragelang.parser import ParseError, Parser


class RageLangTests(unittest.TestCase):
    def error(self, code, error_type):
        with self.assertRaises(error_type):
            compile_source(code)

    def test_lexical_error(self):
        self.error('POKER_FACE OVER_9000 x = @;', LexicalError)

    def test_syntax_error(self):
        self.error('POKER_FACE OVER_9000 x = 1', ParseError)

    def test_undeclared_variable(self):
        self.error('CEREAL_GUY(x);', SemanticError)

    def test_type_error(self):
        self.error('POKER_FACE OVER_9000 x = "texto";', SemanticError)

    def test_constant_error(self):
        self.error('TRUE_STORY OVER_9000 limite = 3; limite = 4;', SemanticError)

    def test_constant_initializer_must_be_constant(self):
        self.error('POKER_FACE OVER_9000 a = 3; TRUE_STORY OVER_9000 b = a;', SemanticError)

    def test_constant_initializer_can_use_constant(self):
        out = compile_source('TRUE_STORY OVER_9000 a = 3; TRUE_STORY OVER_9000 b = a + 2;')
        self.assertIn('const int b = (a + 2);', out)

    def test_constant_read_error(self):
        self.error('TRUE_STORY OVER_9000 limite = 3; ASK_ME_ANYTHING(limite);', SemanticError)

    def test_generation(self):
        output = compile_source('POKER_FACE OVER_9000 idade = 20; DERP (idade >= 18) { CEREAL_GUY("Maior"); } I_LIED { CEREAL_GUY("Menor"); }')
        self.assertIn('int idade = 20;', output)
        self.assertIn('if ((idade >= 18))', output)
        self.assertIn('Console.WriteLine("Maior");', output)

    def test_loop_comments(self):
        output = compile_source('// comentário\nPOKER_FACE OVER_9000 i = 0; FOREVER_ALONE (i < 2) { i = i + 1; }')
        self.assertIn('while ((i < 2))', output)
        self.assertIn('i = (i + 1);', output)

    def test_scope_if(self):
        self.error('DERP (VERDADEIRO) { POKER_FACE OVER_9000 n = 1; } CEREAL_GUY(n);', SemanticError)

    def test_scope_sibling_blocks(self):
        out = compile_source('DERP (VERDADEIRO) { POKER_FACE OVER_9000 n = 1; } I_LIED { POKER_FACE OVER_9000 n = 2; }')
        self.assertIn('int n = 1;', out)
        self.assertIn('int n = 2;', out)

    def test_scope_outer_variable(self):
        out = compile_source('POKER_FACE OVER_9000 n = 1; DERP (VERDADEIRO) { n = 3; }')
        self.assertIn('n = 3;', out)

    def test_read_block_local_type(self):
        out = compile_source('DERP (VERDADEIRO) { POKER_FACE OVER_9000 n = 1; ASK_ME_ANYTHING(n); }')
        self.assertIn('n = int.Parse(Console.ReadLine() ?? "");', out)

    def test_read_bool(self):
        out = compile_source('POKER_FACE FUCK_YEAH ok = NO_GUY; ASK_ME_ANYTHING(ok);')
        self.assertIn('bool.Parse(', out)

    def test_break_outside_loop(self):
        self.error('BREAK;', SemanticError)

    def test_break_inside_if_in_loop(self):
        out = compile_source('FOREVER_ALONE (VERDADEIRO) { DERP (VERDADEIRO) { BREAK; } }')
        self.assertIn('break;', out)

    def test_string_relational_rejected(self):
        self.error('DERP ("a" < "b") { CEREAL_GUY("sim"); }', SemanticError)

    def test_reserved_csharp_identifier(self):
        out = compile_source('POKER_FACE OVER_9000 class = 3; CEREAL_GUY(class);')
        self.assertIn('int @class = 3;', out)
        self.assertIn('Console.WriteLine(@class);', out)

    def test_else_if(self):
        out = compile_source('DERP (NO_GUY) { CEREAL_GUY(0); } I_LIED DERP (VERDADEIRO) { CEREAL_GUY(1); } I_LIED { CEREAL_GUY(2); }')
        self.assertEqual(out.count('if ('), 2)
        self.assertEqual(out.count('else'), 2)

    def test_escape_string(self):
        out = compile_source('CEREAL_GUY("linha\\n\\\"teste\\\"");')
        self.assertIn(r'"linha\n\"teste\""', out)

    def test_invalid_escape(self):
        self.error(r'CEREAL_GUY("teste\q");', LexicalError)

    def test_return_explicit_error(self):
        self.error('NOT_BAD 3;', ParseError)

    def test_extra_semicolons(self):
        out = compile_source(';;;POKER_FACE OVER_9000 x = 1;;;;;')
        self.assertIn('int x = 1;', out)

    def test_identifier_leading_digit(self):
        self.error('POKER_FACE OVER_9000 123abc = 4;', LexicalError)


if __name__ == '__main__':
    unittest.main()
