package com.rvz.serviceeverz.enums;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Provides the list of expected specification keys for each AssetCategory. Used
 * to: - validate incoming spec keys on add/update - render the correct form
 * fields on the frontend - generate bulk-import template columns
 */
public enum SpecificationTemplate {

	LAPTOP(map("RAM", "e.g. 8GB / 16GB / 32GB", "Storage", "e.g. 256GB SSD / 512GB SSD / 1TB HDD", "Processor",
			"e.g. Intel i5-12th / AMD Ryzen 5", "Display", "e.g. 15.6 FHD / 14 FHD / 13.3 Retina", "Battery",
			"e.g. 45Wh / 72Wh", "OS", "e.g. Windows 11 / Ubuntu 22.04", "GraphicsCard",
			"e.g. Integrated / NVIDIA RTX 3050")),

	DESKTOP(map("RAM", "e.g. 8GB / 16GB", "Storage", "e.g. 512GB SSD / 1TB HDD", "Processor", "e.g. Intel i7-12700",
			"GraphicsCard", "e.g. Integrated / NVIDIA RTX 3060", "OS", "e.g. Windows 11", "FormFactor",
			"e.g. Tower / Mini-ITX")),

	MOBILE(map("RAM", "e.g. 6GB / 8GB / 12GB", "Storage", "e.g. 128GB / 256GB", "Camera", "e.g. 50MP+12MP / 108MP",
			"Battery", "e.g. 4500mAh / 5000mAh", "OS", "e.g. Android 14 / iOS 17", "Display",
			"e.g. 6.5 AMOLED / 6.1 Super Retina")),

	TABLET(map("RAM", "e.g. 4GB / 8GB / 12GB", "Storage", "e.g. 64GB / 128GB / 256GB", "Display",
			"e.g. 10.9 Liquid Retina / 11 AMOLED", "Battery", "e.g. 7000mAh / 8000mAh", "OS",
			"e.g. iPadOS 17 / Android 14", "Camera", "e.g. 12MP rear / 8MP front", "Connectivity",
			"e.g. WiFi + LTE / WiFi Only")),

	MONITOR(map("ScreenSize", "e.g. 24 inch / 27 inch / 32 inch", "Resolution", "e.g. Full HD 1080p / 2K QHD / 4K UHD",
			"PanelType", "e.g. IPS / VA / TN / OLED", "RefreshRate", "e.g. 60Hz / 144Hz / 165Hz", "Connectivity",
			"e.g. HDMI, DisplayPort, USB-C", "ResponseTime", "e.g. 1ms / 4ms")),

	PROJECTOR(map("Resolution", "e.g. Full HD 1080p / 4K / WXGA", "Brightness", "e.g. 3000 ANSI Lumens", "ThrowRatio",
			"e.g. 1.5:1 / Short Throw", "LampLife", "e.g. 4000 hours / 10000 hours LED", "Connectivity",
			"e.g. HDMI, VGA, USB", "Weight", "e.g. 2.5 kg")),

	PRINTER(map("PrintType", "e.g. LaserJet / Inkjet", "PrintSpeed", "e.g. 25 ppm", "Connectivity",
			"e.g. USB, WiFi, Ethernet", "ColorSupport", "e.g. Mono / Color", "DuplexPrint", "e.g. Yes / No")),

	SCANNER(map("ScanResolution", "e.g. 600 dpi", "ScanType", "e.g. Flatbed / ADF", "Connectivity", "e.g. USB, WiFi")),

	NETWORK_DEVICE(map("DeviceType", "e.g. Router / Switch / Access Point", "Ports", "e.g. 8x GbE / 24x GbE",
			"WirelessStd", "e.g. WiFi 6 / WiFi 5", "Throughput", "e.g. 1 Gbps")),

	SERVER(map("CPU", "e.g. Xeon Silver 4210", "RAM", "e.g. 64GB ECC", "Storage", "e.g. 4x 2TB SAS", "FormFactor",
			"e.g. 1U Rack / Tower", "OS", "e.g. Ubuntu Server 22.04")),

	PERIPHERAL(map("PeripheralType", "e.g. Keyboard / Mouse / Webcam / Headset / USB Hub", "Connectivity",
			"e.g. USB / Bluetooth / Wireless 2.4GHz", "Compatibility", "e.g. Windows, macOS, Linux")),

	OTHER(map()); // no mandatory keys; free-form

	private final Map<String, String> fields; // key → hint/placeholder

	SpecificationTemplate(Map<String, String> fields) {
		this.fields = fields;
	}

	public Map<String, String> getFields() {
		return fields;
	}

	/** Returns the template for a given category name, or OTHER if not found. */
	public static SpecificationTemplate forCategory(String categoryName) {
		if (categoryName == null)
			return OTHER;
		try {
			return SpecificationTemplate.valueOf(categoryName.toUpperCase());
		} catch (IllegalArgumentException e) {
			return OTHER;
		}
	}

	// ── tiny builder helper ───────────────────────────────────────
	private static Map<String, String> map(String... pairs) {
		Map<String, String> m = new LinkedHashMap<>();
		for (int i = 0; i + 1 < pairs.length; i += 2)
			m.put(pairs[i], pairs[i + 1]);
		return m;
	}
}
