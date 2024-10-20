import {
	type CommandInteraction,
	SlashCommandBuilder,
} from "discord.js";
import type CommandWithArgs from "../types/commandWithArgs";
import * as fs from 'fs';
import * as path from 'path';
import getCurrentTimestamp from "../utils/getCurrentTimestamp";

const texCommand: CommandWithArgs = {
	data: new SlashCommandBuilder()
		.setName("tex")
		.setDescription("texを画像で表示します")
		.addStringOption((option) =>
			option
				.setName("tex")
				.setDescription("tex script")
				.setRequired(true),
		) as SlashCommandBuilder,
	execute: texCommandHandler,
};

async function texCommandHandler(interaction: CommandInteraction) {
	try {
		if (!interaction.guild) {
			await interaction.reply("このコマンドはサーバー内でのみ使用可能です。");
			return;
		}

		printLog(interaction);

		const texOption = interaction.options.get("tex");
		if (!texOption || !texOption.value) {
			await interaction.reply("texを指定してください。");
			return;
		}

		const svgString = await renderMathToSVG(texOption.value as string);
		const outputPath = prepareOutputFilePath();
		await convertSVGToPNG(svgString, outputPath);
		await interaction.reply({ files: [outputPath] });
	} catch (error) {
		console.error('[ERROR] Error handling tex command:', error);
		await interaction.reply('エラーが発生しました。再試行してください。');
	}
}

function prepareOutputFilePath(): string {
	const outputDir = path.join(__dirname, '../../tex_png');
	ensureDirectoryExists(outputDir);
	const timestamp = getCurrentTimestamp();
	return path.join(outputDir, `tex_${timestamp}.png`);
}

async function renderMathToSVG(latex: string, fontSize: number = 12): Promise<string> {
	// mathjax does not have typescript support yet
	const mathjax = require('mathjax');
	const MathJax = await mathjax.init({
		loader: { load: ['input/tex', 'output/svg'] },
		svg: {
			fontCache: 'none',
			scale: fontSize / 12,
		},
		styles: {
			'.mjx-svg-href': { fill: 'white', stroke: 'white' },
			text: { fill: 'white' },
		}
	});

	const svg = MathJax.tex2svg(latex, { display: true });
	let svgString = MathJax.startup.adaptor.outerHTML(svg);

	// whiten the text
	if (svgString.includes('fill=')) {
		svgString = svgString.replace(/fill="[^"]*"/g, 'fill="white"');
	} else {
		svgString = svgString.replace(/<g/, '<g fill="white"');
	}


	// remove the XML declaration
	const svgMatch = svgString.match(/<svg[\s\S]*<\/svg>/);
	if (svgMatch) {
		return svgMatch[0];
	} else {
		throw new Error('Invalid SVG format');
	}
}

async function convertSVGToPNG(svg: string, outputPath: string, scaleFactor: number = 1): Promise<void> {
	// sharp does not have typescript support yet
	const sharp: any = require('sharp');

	// Validate SVG format
	if (!svg.startsWith('<svg')) {
		throw new Error('Invalid SVG format');
	}

	const svgWidthMatch = svg.match(/width="([\d.]+)ex"/);
	const svgHeightMatch = svg.match(/height="([\d.]+)ex"/);
	if (svgWidthMatch && svgHeightMatch) {
		const svgWidth = parseFloat(svgWidthMatch[1]);
		const svgHeight = parseFloat(svgHeightMatch[1]);

		// Get the width and height of the PNG image
		const exToPx = 16;
		const width = Math.ceil(svgWidth * exToPx * scaleFactor);
		const height = Math.ceil(svgHeight * exToPx * scaleFactor);

		await sharp(Buffer.from(svg))
			.resize({ width: width, height: height }) // Scaling the SVG to the desired size
			.png()
			.toFile(outputPath);
		console.log(`[LOG] PNG file saved as ${outputPath}`);
	} else {
		throw new Error('Unable to determine SVG dimensions');
	}
}

function ensureDirectoryExists(dir: string): void {
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
		console.log(`[LOG] Directory created: ${dir}`);
	}
}

function printLog(interaction: CommandInteraction) {
	console.log(`[COMMAND] tex command terminated by ${interaction.user}`);
}

export default texCommand;
