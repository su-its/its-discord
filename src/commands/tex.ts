import {
	type CommandInteraction,
	SlashCommandBuilder,
} from "discord.js";
import type CommandWithArgs from "../types/commandWithArgs";
import * as fs from 'fs';
import * as path from 'path';
import getCurrentTimestamp from "../utils/getCurrentTimestamp";
import sharp from 'sharp';

import { mathjax } from 'mathjax-full/js/mathjax.js';
import { TeX } from 'mathjax-full/js/input/tex.js';
import { SVG } from 'mathjax-full/js/output/svg.js';
import { liteAdaptor } from 'mathjax-full/js/adaptors/liteAdaptor.js';
import { RegisterHTMLHandler } from 'mathjax-full/js/handlers/html.js';
import { AllPackages } from 'mathjax-full/js/input/tex/AllPackages.js';

// Initialize MathJax
const tex = new TeX({ packages: AllPackages });
const svg = new SVG({ fontCache: 'none' });
const adaptor = liteAdaptor();
RegisterHTMLHandler(adaptor);
const html = mathjax.document('', { InputJax: tex, OutputJax: svg });

const texCommand: CommandWithArgs = {
	data: new SlashCommandBuilder()
		.setName("tex")
		.setDescription("TeXを画像で表示します")
		.addStringOption(option =>
			option.setName("tex")
				.setDescription("TeXのスクリプト")
				.setRequired(true),
		) as SlashCommandBuilder,
	execute: texCommandHandler,
};

async function texCommandHandler(interaction: CommandInteraction) {
	try {
		if (!interaction.guild) {
			return await interaction.reply("このコマンドはサーバー内でのみ使用可能です。");
		}

		const texOption = interaction.options.get("tex");
		if (!texOption || !texOption.value) {
			return await interaction.reply("TeXを指定してください。");
		}

		const svgString = await generateSVG(texOption.value as string);
		const outputPath = prepareOutputFilePath();
		await convertSVGToPNG(svgString, outputPath);
		await interaction.reply({ files: [outputPath] });

	} catch (error) {
		console.error('[ERROR] Error handling tex command:', error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp('エラーが発生しました。再試行してください。');
		} else {
			await interaction.reply('エラーが発生しました。再試行してください。');
		}
	}
}

// SVG生成関数
async function generateSVG(latex: string, fontSize: number = 12): Promise<string> {
	try {
		const node = html.convert(latex, { display: true });
		let svgString = adaptor.outerHTML(node);

		// whiten the text
		if (svgString.includes('fill=')) {
			svgString = svgString.replace(/fill="[^"]*"/g, 'fill="white"');
		} else {
			svgString = svgString.replace(/<g/, '<g fill="white"');
		}

		// Extract the SVG content
		const svgMatch = svgString.match(/<svg[\s\S]*<\/svg>/);
		if (svgMatch) {
			return svgMatch[0];
		} else {
			throw new Error('Invalid SVG format');
		}
	} catch (error) {
		throw new Error(`[ERROR] Failed to render TeX to SVG: ${error}`);
	}
}

async function convertSVGToPNG(svg: string, outputPath: string, scaleFactor: number = 1): Promise<void> {
	if (!svg.startsWith('<svg')) {
		throw new Error('Invalid SVG format');
	}

	const { width, height } = getSVGDimensions(svg);

	if (width && height) {
		const exToPx = 16;
		await sharp(Buffer.from(svg))
			.resize({ width: Math.ceil(width * exToPx * scaleFactor), height: Math.ceil(height * exToPx * scaleFactor) })
			.png()
			.toFile(outputPath);
		console.log(`[LOG] PNG file saved as ${outputPath}`);
	} else {
		throw new Error('Unable to determine SVG dimensions');
	}
}

function getSVGDimensions(svg: string): { width: number, height: number } {
	const svgWidthMatch = svg.match(/width="([\d.]+)ex"/);
	const svgHeightMatch = svg.match(/height="([\d.]+)ex"/);
	if (svgWidthMatch && svgHeightMatch) {
		return { width: parseFloat(svgWidthMatch[1]), height: parseFloat(svgHeightMatch[1]) };
	}
	return { width: 0, height: 0 };
}

function prepareOutputFilePath(): string {
	const outputDir = path.join(__dirname, '../../tex_png');
	ensureDirectoryExists(outputDir);
	return path.join(outputDir, `tex_${getCurrentTimestamp()}.png`);
}

function ensureDirectoryExists(dir: string): void {
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
		console.log(`[LOG] Directory created: ${dir}`);
	}
}

export default texCommand;
