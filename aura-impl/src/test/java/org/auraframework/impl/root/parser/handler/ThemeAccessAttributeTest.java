/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.auraframework.impl.root.parser.handler;

public class ThemeAccessAttributeTest extends BaseAccessAttributeTest {

	public ThemeAccessAttributeTest(String name) {
		super(name);
		testResource = TestResource.Theme;
	}
	
	// Stub out non-sensical combination (Themes not supported in custom, non-privileged, namespaces at this time)

	@Override
	public void testSimpleAccessDynamicInCustomNamespace() throws Exception {
	}

	@Override
	public void testCombinationAccessInCustomNamespace() throws Exception {
	}

	@Override
	public void testSimpleAuthenticationInCustomNamespace() throws Exception {
	}

	@Override
	public void testSimpleAuthenticationDynamicInCustomNamespace() throws Exception {
	}
	
	@Override
	public void testCombinationAuthenticationInCustomNamespace() throws Exception {
	}

	@Override
	public void testAccessAuthenticationInCustomNamespace() throws Exception {
	}
	
		
	// Remove these when bugs are fixed.
	@Override
	public void testSimpleAccessInSystemNamespace() throws Exception {		
	}

	@Override
	public void testSimpleAccessDynamicInSystemNamespace() throws Exception {		
	}
	
	@Override
	public void testSimpleAccessInCustomNamespace() throws Exception {		
	}
}
