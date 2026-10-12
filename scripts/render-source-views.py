"""Render labelled excerpts from public project source as SVG portfolio images."""
import argparse, html, json, re, textwrap
from pathlib import Path

def render(title, path, lines, output, ink="#f19ab8"):
    # These are source excerpts, not reconstructions of product interfaces.
    rows = []
    for line in lines:
        rows.extend(textwrap.wrap(line.expandtabs(4), width=79, replace_whitespace=False, drop_whitespace=False) or [""])
    rows = rows[:18]
    text = []
    for i, line in enumerate(rows):
        color = ink if line.lstrip().startswith(("#", "def ", "class ", "struct ", "async ", "|")) else "#ddd8d0"
        text.append(f'<text x="72" y="{150+i*29}" fill="{color}">{html.escape(line)}</text>')
    content = f'<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="750" viewBox="0 0 1200 750"><rect width="1200" height="750" fill="#181716"/><text x="72" y="60" fill="#a8a69f" font-family="monospace" font-size="18">{html.escape(title)} / {html.escape(path)}</text><path d="M72 90H1128" stroke="#373431"/><g font-family="monospace" font-size="21">{"".join(text)}</g><text x="72" y="711" fill="#a8a69f" font-family="monospace" font-size="15">original source excerpt</text></svg>'
    Path(output).write_text(content)

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("input")
    parser.add_argument("output")
    args=parser.parse_args()
    source=json.loads(Path(args.input).read_text())
    out=Path(args.output);out.mkdir(parents=True,exist_ok=True)
    colours=["#f19ab8","#b8d2c7","#c9b8d9","#d9c3a3"]
    for i,(name,data) in enumerate(source.items()):
        if name in ["pdku-personas","pdku-arena"]:continue
        raw=data.get("source") or data.get("readme","")
        path=data.get("sourcePath","README.md")
        if data.get("source"):
            lines=raw.splitlines()
            # Show a real function or UI definition, with its surrounding code.
            start=next((j for j,line in enumerate(lines) if line.startswith(("def ","async def ","struct PrompterView"))),0)
            excerpt=lines[start:start+18]
        else:
            blocks=re.findall(r"```[^\n]*\n(.*?)```",raw,re.S)
            if blocks:excerpt=blocks[0].strip("\n").splitlines()
            else:excerpt=raw.splitlines()[:18]
        if not excerpt:raise ValueError("No original source for "+name)
        render(name,path,excerpt,out/(name+".svg"),colours[i%len(colours)])
if __name__=="__main__":main()
